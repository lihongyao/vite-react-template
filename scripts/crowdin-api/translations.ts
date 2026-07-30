import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';

import type { CrowdinTarget } from './config.js';
import { loadCrowdinConfig } from './config.js';
import { logInfo, logWarn } from './logger.js';
import { DOWNLOADS_DIR, LOCALES_DIR, SOURCE_LOCALE } from './paths.js';
import { listSourceFiles } from './source-files.js';

export type TranslationTree = {
  [key: string]: string | TranslationTree;
};

type SourceShard = {
  fileName: string;
  tree: TranslationTree;
  leaves: Map<string, string>;
};

type LocaleStats = {
  translated: number;
  fallback: number;
  ignored: number;
  invalid: number;
};

const forbiddenKeys = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateTranslationNode(
  value: unknown,
  filePath: string,
  keyPath: string,
  allowEmptyStrings: boolean,
): asserts value is TranslationTree {
  if (!isPlainObject(value)) {
    throw new Error(`${filePath}: ${keyPath || '<root>'} 必须是对象`);
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = keyPath ? `${keyPath}.${key}` : key;
    if (!key || key.includes('.') || forbiddenKeys.has(key)) {
      throw new Error(`${filePath}: 非法翻译 key "${childPath}"`);
    }

    if (typeof child === 'string') {
      if (!allowEmptyStrings && child.trim() === '') {
        throw new Error(`${filePath}: 源文案 "${childPath}" 不能为空`);
      }
      continue;
    }

    validateTranslationNode(child, filePath, childPath, allowEmptyStrings);
  }
}

function flattenTree(tree: TranslationTree, prefix = '', result = new Map<string, string>()) {
  for (const [key, value] of Object.entries(tree)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result.set(keyPath, value);
    } else {
      flattenTree(value, keyPath, result);
    }
  }
  return result;
}

function collectShape(
  tree: TranslationTree,
  fileName: string,
  prefix: string,
  shape: Map<string, { kind: 'branch' | 'leaf'; files: string[] }>,
) {
  for (const [key, value] of Object.entries(tree)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    const kind = typeof value === 'string' ? 'leaf' : 'branch';
    const previous = shape.get(keyPath);

    if (previous && (previous.kind !== kind || kind === 'leaf')) {
      throw new Error(`source key 冲突 "${keyPath}": ${[...previous.files, fileName].join(', ')}`);
    }

    if (previous) {
      previous.files.push(fileName);
    } else {
      shape.set(keyPath, { kind, files: [fileName] });
    }

    if (kind === 'branch') {
      collectShape(value as TranslationTree, fileName, keyPath, shape);
    }
  }
}

export function parseTranslationText(
  content: string,
  filePath: string,
  options: { allowEmptyStrings: boolean },
) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`${filePath}: JSON 解析失败: ${(error as Error).message}`, { cause: error });
  }

  validateTranslationNode(parsed, filePath, '', options.allowEmptyStrings);
  return parsed;
}

export function readTranslationFile(filePath: string, options: { allowEmptyStrings: boolean }) {
  return parseTranslationText(readFileSync(filePath, 'utf8'), filePath, options);
}

export function writeTranslationFile(filePath: string, tree: TranslationTree) {
  const directory = dirname(filePath);
  mkdirSync(directory, { recursive: true });
  const temporaryPath = join(directory, `.${basename(filePath)}.${process.pid}.tmp`);

  // 先写同目录临时文件再 rename，避免进程中断留下半份 JSON。
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(tree, null, 2)}\n`, 'utf8');
    renameSync(temporaryPath, filePath);
  } catch (error) {
    if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
    throw error;
  }
}

function loadSourceShards() {
  const sourceFiles = listSourceFiles();
  if (sourceFiles.length === 0) {
    throw new Error('src/i18n/source 中没有 JSON 文件');
  }

  const shape = new Map<string, { kind: 'branch' | 'leaf'; files: string[] }>();
  return sourceFiles.map<SourceShard>((filePath) => {
    const fileName = basename(filePath);
    const tree = readTranslationFile(filePath, { allowEmptyStrings: false });
    collectShape(tree, fileName, '', shape);
    return { fileName, tree, leaves: flattenTree(tree) };
  });
}

function mergeSourceTrees(shards: SourceShard[]) {
  const result: TranslationTree = {};

  const merge = (target: TranslationTree, source: TranslationTree) => {
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'string') {
        target[key] = value;
      } else {
        const existing = target[key];
        const child: TranslationTree = typeof existing === 'object' ? existing : {};
        target[key] = child;
        merge(child, value);
      }
    }
  };

  for (const shard of shards) merge(result, shard.tree);
  return result;
}

function extractInterpolations(value: string) {
  return [...value.matchAll(/{{\s*([A-Za-z0-9_.-]+)(?:\s*,[^}]*)?}}/g)]
    .map((match) => match[1])
    .toSorted();
}

function extractTags(value: string) {
  return [...value.matchAll(/<\s*(\/?)\s*([A-Za-z][A-Za-z0-9_-]*)\b[^>]*>/g)]
    .map((match) => `${match[1]}${match[2]}`)
    .toSorted();
}

function assertTokensMatch(source: string, translation: string, locale: string, keyPath: string) {
  const sourceInterpolations = extractInterpolations(source);
  const targetInterpolations = extractInterpolations(translation);
  if (sourceInterpolations.join('|') !== targetInterpolations.join('|')) {
    throw new Error(
      `${locale}.${keyPath}: 插值变量不一致，源文案为 [${sourceInterpolations.join(', ')}]，` +
        `翻译为 [${targetInterpolations.join(', ')}]`,
    );
  }

  const sourceTags = extractTags(source);
  const targetTags = extractTags(translation);
  if (sourceTags.join('|') !== targetTags.join('|')) {
    throw new Error(
      `${locale}.${keyPath}: 标签不一致，源文案为 [${sourceTags.join(', ')}]，` +
        `翻译为 [${targetTags.join(', ')}]`,
    );
  }
}

function reconcileShard(
  source: TranslationTree,
  translation: TranslationTree | undefined,
  locale: string,
  stats: LocaleStats,
  strictTranslations: boolean,
  prefix = '',
): TranslationTree {
  const result: TranslationTree = {};

  // source 决定最终 key 集合；translation 只提供值，因此废弃 key 会自然被过滤。
  for (const [key, sourceValue] of Object.entries(source)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    const translatedValue = translation?.[key];

    if (typeof sourceValue === 'string') {
      if (
        strictTranslations &&
        translatedValue !== undefined &&
        typeof translatedValue !== 'string'
      ) {
        throw new Error(`${locale}.${keyPath}: 翻译应为字符串，但实际为对象`);
      }

      if (typeof translatedValue === 'string' && translatedValue.trim() !== '') {
        try {
          assertTokensMatch(sourceValue, translatedValue, locale, keyPath);
          result[key] = translatedValue;
          stats.translated += 1;
        } catch (error) {
          if (strictTranslations) throw error;
          result[key] = sourceValue;
          stats.fallback += 1;
          stats.invalid += 1;
        }
      } else {
        result[key] = sourceValue;
        stats.fallback += 1;
      }
      continue;
    }

    if (strictTranslations && translatedValue !== undefined && !isPlainObject(translatedValue)) {
      throw new Error(`${locale}.${keyPath}: 翻译应为对象，但实际为字符串`);
    }

    result[key] = reconcileShard(
      sourceValue,
      isPlainObject(translatedValue) ? translatedValue : undefined,
      locale,
      stats,
      strictTranslations,
      keyPath,
    );
  }

  return result;
}

function mergeReconciledTree(target: TranslationTree, source: TranslationTree) {
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') {
      target[key] = value;
    } else {
      const child = (target[key] as TranslationTree | undefined) || {};
      target[key] = child;
      mergeReconciledTree(child, value);
    }
  }
}

function buildTargetLocale(
  target: CrowdinTarget,
  shards: SourceShard[],
  strictTranslations: boolean,
) {
  const result: TranslationTree = {};
  const stats: LocaleStats = { translated: 0, fallback: 0, ignored: 0, invalid: 0 };

  for (const shard of shards) {
    const translationPath = join(DOWNLOADS_DIR, target.localLocale, shard.fileName);
    const translation = existsSync(translationPath)
      ? readTranslationFile(translationPath, { allowEmptyStrings: true })
      : undefined;

    if (translation) {
      const translatedLeaves = flattenTree(translation);
      stats.ignored += [...translatedLeaves.keys()].filter(
        (keyPath) => !shard.leaves.has(keyPath),
      ).length;
    }

    mergeReconciledTree(
      result,
      reconcileShard(shard.tree, translation, target.localLocale, stats, strictTranslations),
    );
  }

  return { tree: result, stats };
}

export function validateTranslationAgainstSource(
  sourceFilePath: string,
  locale: string,
  translation: TranslationTree,
) {
  const source = readTranslationFile(sourceFilePath, { allowEmptyStrings: false });
  const stats: LocaleStats = { translated: 0, fallback: 0, ignored: 0, invalid: 0 };
  reconcileShard(source, translation, locale, stats, true);
}

/**
 * 将任务级 source/downloads 分片重建为应用直接加载的四份 locale。
 * 非严格模式对缺失或失效翻译使用中文，严格模式用于 CI/人工检查。
 */
export function buildLocales(options: {
  write: boolean;
  strictTranslations?: boolean;
  logSummary?: boolean;
}) {
  const config = loadCrowdinConfig();
  const shards = loadSourceShards();
  const sourceTree = mergeSourceTrees(shards);
  const sourceKeyCount = flattenTree(sourceTree).size;
  const targets = config.targets.map((target) => ({
    target,
    ...buildTargetLocale(target, shards, options.strictTranslations ?? false),
  }));

  if (options.write) {
    writeTranslationFile(join(LOCALES_DIR, `${SOURCE_LOCALE}.json`), sourceTree);
    for (const { target, tree } of targets) {
      writeTranslationFile(join(LOCALES_DIR, `${target.localLocale}.json`), tree);
    }
  }

  if (options.logSummary !== false) {
    const translatedSummary = targets
      .map(({ target, stats }) => `${target.localLocale} ${stats.translated}/${sourceKeyCount}`)
      .join('，');
    const warnings = targets.flatMap(({ target, stats }) => {
      const items: string[] = [];
      if (stats.fallback > 0) items.push(`${target.localLocale} 回退 ${stats.fallback}`);
      if (stats.invalid > 0) items.push(`${target.localLocale} 无效 ${stats.invalid}`);
      if (stats.ignored > 0) items.push(`${target.localLocale} 废弃 ${stats.ignored}`);
      return items;
    });

    logInfo(
      `${SOURCE_LOCALE}: ${shards.length} source / ${sourceKeyCount} key；${translatedSummary}`,
    );
    if (warnings.length > 0) logWarn(warnings.join('，'));
  }

  return { sourceTree, targets, sourceKeyCount };
}
