import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, extname, isAbsolute, join, relative, resolve } from 'node:path';

import { PROJECT_ROOT, SOURCE_DIR } from './paths.js';

function assertInsideSourceDirectory(filePath: string) {
  const relativePath = relative(SOURCE_DIR, filePath);
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`source 文件必须位于 ${SOURCE_DIR}`);
  }
}

/** 将 Git 分支名稳定映射为扁平的 JSON 文件名，避免创建嵌套任务目录。 */
export function branchNameToFileName(branchName: string) {
  const normalized = branchName
    .trim()
    .replaceAll('/', '__')
    .replaceAll('\\', '__')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^\.+/, '')
    .replace(/-+$/g, '');

  if (!normalized || normalized === 'HEAD') {
    throw new Error(`无法根据分支名 "${branchName}" 生成 source 文件名`);
  }

  return normalized.endsWith('.json') ? normalized : `${normalized}.json`;
}

export function getCurrentBranchName() {
  const branchName = execFileSync('git', ['branch', '--show-current'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
  }).trim();

  if (!branchName) {
    throw new Error('当前处于 detached HEAD，请显式指定任务文件');
  }

  return branchName;
}

export function getCurrentBranchSourcePath() {
  return join(SOURCE_DIR, branchNameToFileName(getCurrentBranchName()));
}

export function listSourceFiles() {
  if (!existsSync(SOURCE_DIR)) return [];

  return readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => join(SOURCE_DIR, entry.name))
    .toSorted((a, b) => basename(a).localeCompare(basename(b)));
}

function findByTaskIdentifier(selector: string) {
  const identifier = selector.replace(/\.json$/i, '');
  const matches = listSourceFiles().filter((filePath) => {
    const stem = basename(filePath, '.json');
    return (
      stem === identifier || stem.endsWith(`__${identifier}`) || stem.endsWith(`-${identifier}`)
    );
  });

  if (matches.length > 1) {
    throw new Error(
      `任务标识 "${selector}" 匹配到多个 source 文件:\n${matches
        .map((filePath) => `  - ${relative(PROJECT_ROOT, filePath)}`)
        .join('\n')}`,
    );
  }

  return matches[0];
}

/**
 * 支持完整路径、文件名、分支名和任务号后缀四种选择方式。
 * 任务号匹配到多个文件时必须由开发者显式消除歧义。
 */
export function resolveSourceFile(selector?: string) {
  if (!selector) {
    const currentBranchFile = getCurrentBranchSourcePath();
    if (!existsSync(currentBranchFile)) {
      throw new Error(
        `当前分支对应的 source 文件不存在: ${relative(PROJECT_ROOT, currentBranchFile)}\n` +
          '请先执行 pnpm crowdin:create，或显式指定文件',
      );
    }
    return currentBranchFile;
  }

  const pathCandidate = isAbsolute(selector) ? resolve(selector) : resolve(PROJECT_ROOT, selector);
  if (existsSync(pathCandidate)) {
    assertInsideSourceDirectory(pathCandidate);
    if (extname(pathCandidate) !== '.json') {
      throw new Error(`source 文件必须是 JSON: ${pathCandidate}`);
    }
    return pathCandidate;
  }

  const fileName = branchNameToFileName(selector);
  const sourceCandidate = join(SOURCE_DIR, fileName);
  if (existsSync(sourceCandidate)) return sourceCandidate;

  const identifierMatch = findByTaskIdentifier(selector);
  if (identifierMatch) return identifierMatch;

  throw new Error(`找不到 source 文件: ${selector}`);
}

export function getCreateSourcePath(name?: string) {
  mkdirSync(SOURCE_DIR, { recursive: true });
  const fileName = branchNameToFileName(name || getCurrentBranchName());
  const filePath = join(SOURCE_DIR, fileName);
  assertInsideSourceDirectory(filePath);
  return filePath;
}
