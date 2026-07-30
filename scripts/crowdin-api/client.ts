import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { Client, type SourceFilesModel } from '@crowdin/crowdin-api-client';

import type { CrowdinConfig, CrowdinTarget } from './config.js';
import { loadCrowdinConfig } from './config.js';
import { logProgress } from './logger.js';
import { DOWNLOADS_DIR, SOURCE_LOCALE } from './paths.js';
import {
  type TranslationTree,
  parseTranslationText,
  validateTranslationAgainstSource,
  writeTranslationFile,
} from './translations.js';

type PendingDownload = {
  outputPath: string;
  tree: TranslationTree;
};

/**
 * 封装 Crowdin 远端读写。source 只允许上传，下载结果只写入 downloads，
 * 防止 pull 意外覆盖开发者维护的中文源文案。
 */
export class CrowdinService {
  private readonly config: CrowdinConfig;
  private readonly client: Client;
  private branchId: number | undefined;
  private projectValidated = false;

  constructor() {
    this.config = loadCrowdinConfig();
    this.client = new Client(
      { token: this.config.apiToken },
      {
        httpRequestTimeout: 60_000,
        retryConfig: {
          retries: 2,
          waitInterval: 500,
          conditions: [],
        },
      },
    );
  }

  private async validateProjectLanguages() {
    if (this.projectValidated) return;

    const response = await this.client.projectsGroupsApi.getProject(this.config.projectId);
    const project = response.data;

    if (project.sourceLanguageId !== SOURCE_LOCALE) {
      throw new Error(
        `Crowdin 项目源语言为 ${project.sourceLanguageId}，当前架构要求 ${SOURCE_LOCALE}。` +
          '请先在 Crowdin 项目设置中修正源语言',
      );
    }

    const missingTargets = this.config.targets
      .map((target) => target.crowdinLocale)
      .filter((locale) => !project.targetLanguageIds.includes(locale));
    if (missingTargets.length > 0) {
      throw new Error(`Crowdin 项目缺少目标语言: ${missingTargets.join(', ')}`);
    }

    this.projectValidated = true;
  }

  private async resolveBranch(options: { create: boolean }) {
    if (this.branchId) return this.branchId;

    const branches = await this.client.sourceFilesApi.listProjectBranches(this.config.projectId, {
      name: this.config.branch,
      limit: 100,
    });
    const existing = branches.data
      .map((item) => item.data)
      .find((branch) => branch.name === this.config.branch);

    if (existing) {
      this.branchId = existing.id;
      return existing.id;
    }

    if (!options.create) {
      throw new Error(`Crowdin 分支不存在: ${this.config.branch}`);
    }

    const created = await this.client.sourceFilesApi.createBranch(this.config.projectId, {
      name: this.config.branch,
    });
    this.branchId = created.data.id;
    return created.data.id;
  }

  private async listBranchFiles(branchId: number) {
    const files: SourceFilesModel.File[] = [];
    const limit = 500;

    for (let offset = 0; ; offset += limit) {
      const response = await this.client.sourceFilesApi.listProjectFiles(this.config.projectId, {
        branchId,
        limit,
        offset,
        recursion: 'true',
      });
      files.push(...response.data.map((item) => item.data));
      if (response.data.length < limit) break;
    }

    return files;
  }

  private indexBranchFiles(files: SourceFilesModel.File[]) {
    const indexed = new Map<string, SourceFilesModel.File>();

    for (const file of files) {
      const duplicate = indexed.get(file.name);
      if (duplicate) {
        throw new Error(
          `Crowdin ${this.config.branch} 分支存在同名 source: ${duplicate.path}, ${file.path}`,
        );
      }
      indexed.set(file.name, file);
    }

    return indexed;
  }

  async uploadSourceFiles(sourceFilePaths: string[]) {
    await this.validateProjectLanguages();
    const branchId = await this.resolveBranch({ create: true });
    const remoteFiles = await this.listBranchFiles(branchId);
    const remoteByName = this.indexBranchFiles(remoteFiles);
    let createdCount = 0;
    let updatedCount = 0;

    // 多人分支并行时，本地列表不完整，因此这里只创建或更新，不删除远端文件。
    for (const [index, sourceFilePath] of sourceFilePaths.entries()) {
      const fileName = basename(sourceFilePath);
      if (sourceFilePaths.length > 1) logProgress(index + 1, sourceFilePaths.length, fileName);
      const storage = await this.client.uploadStorageApi.addStorage(
        fileName,
        readFileSync(sourceFilePath),
        'application/json',
      );
      const existing = remoteByName.get(fileName);

      if (existing) {
        await this.client.sourceFilesApi.updateOrRestoreFile(this.config.projectId, existing.id, {
          storageId: storage.data.id,
          updateOption: 'keep_translations',
          exportOptions: { exportPattern: this.config.translationPattern },
        });
        updatedCount += 1;
      } else {
        const created = await this.client.sourceFilesApi.createFile(this.config.projectId, {
          branchId,
          name: fileName,
          storageId: storage.data.id,
          type: 'json',
          exportOptions: { exportPattern: this.config.translationPattern },
        });
        remoteByName.set(fileName, created.data);
        createdCount += 1;
      }
    }

    return { created: createdCount, updated: updatedCount };
  }

  private async downloadTarget(
    file: SourceFilesModel.File,
    sourceFilePath: string,
    target: CrowdinTarget,
    approvedOnly: boolean,
  ): Promise<PendingDownload> {
    const result = await this.client.translationsApi.buildProjectFileTranslation(
      this.config.projectId,
      file.id,
      {
        targetLanguageId: target.crowdinLocale,
        exportApprovedOnly: approvedOnly,
        skipUntranslatedFiles: false,
        skipUntranslatedStrings: true,
      },
    );
    const response = await fetch(result.data.url);
    if (!response.ok) {
      throw new Error(
        `下载 ${file.name} (${target.crowdinLocale}) 失败: ${response.status} ${response.statusText}`,
      );
    }

    const outputPath = join(DOWNLOADS_DIR, target.localLocale, file.name);
    const tree = parseTranslationText(await response.text(), outputPath, {
      allowEmptyStrings: true,
    });
    validateTranslationAgainstSource(sourceFilePath, target.localLocale, tree);
    return { outputPath, tree };
  }

  async downloadTranslations(sourceFilePaths: string[], options: { approvedOnly: boolean }) {
    await this.validateProjectLanguages();
    const branchId = await this.resolveBranch({ create: false });
    const remoteFiles = await this.listBranchFiles(branchId);
    const remoteByName = this.indexBranchFiles(remoteFiles);
    const pending: PendingDownload[] = [];
    const total = sourceFilePaths.length * this.config.targets.length;
    let current = 0;

    // 全部下载到内存并严格校验后再写入，失败时保留已有 downloads。
    for (const sourceFilePath of sourceFilePaths) {
      const fileName = basename(sourceFilePath);
      const remoteFile = remoteByName.get(fileName);
      if (!remoteFile) {
        throw new Error(`Crowdin ${this.config.branch} 分支中找不到 source: ${fileName}`);
      }

      for (const target of this.config.targets) {
        current += 1;
        if (sourceFilePaths.length > 1) {
          logProgress(
            current,
            total,
            `${fileName} (${target.crowdinLocale} -> ${target.localLocale})`,
          );
        }
        pending.push(
          await this.downloadTarget(remoteFile, sourceFilePath, target, options.approvedOnly),
        );
      }
    }

    for (const item of pending) writeTranslationFile(item.outputPath, item.tree);
    return { updated: pending.length };
  }
}
