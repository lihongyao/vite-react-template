import { readFileSync } from 'node:fs';

import YAML from 'yaml';

import { CROWDIN_CONFIG_PATH } from './paths.js';

type RawCrowdinFileConfig = {
  source?: unknown;
  translation?: unknown;
  languages_mapping?: {
    locale?: Record<string, unknown>;
  };
};

type RawCrowdinConfig = {
  project_id?: unknown;
  api_token?: unknown;
  branch?: unknown;
  files?: RawCrowdinFileConfig[];
};

export type CrowdinTarget = {
  crowdinLocale: string;
  localLocale: string;
};

export type CrowdinConfig = {
  projectId: number;
  apiToken: string;
  branch: string;
  sourcePattern: string;
  translationPattern: string;
  targets: CrowdinTarget[];
};

function requireNonEmptyString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`crowdin.yml 缺少有效的 ${field}`);
  }

  return value.trim();
}

/**
 * crowdin.yml 是项目号、凭证、固定远端分支和语言目录映射的唯一配置入口。
 * 所有命令启动时都会重新读取，避免脚本内出现另一套语言映射。
 */
export function loadCrowdinConfig(): CrowdinConfig {
  const raw = YAML.parse(readFileSync(CROWDIN_CONFIG_PATH, 'utf8')) as RawCrowdinConfig;
  const projectId = Number(raw.project_id);

  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    throw new Error('crowdin.yml 缺少有效的 project_id');
  }

  const fileConfig = raw.files?.[0];
  if (!fileConfig) {
    throw new Error('crowdin.yml 至少需要一个 files 配置');
  }

  const mapping = fileConfig.languages_mapping?.locale;
  if (!mapping || Object.keys(mapping).length === 0) {
    throw new Error('crowdin.yml 缺少 languages_mapping.locale');
  }

  const targets = Object.entries(mapping).map(([crowdinLocale, localLocale]) => ({
    crowdinLocale,
    localLocale: requireNonEmptyString(localLocale, `languages_mapping.locale.${crowdinLocale}`),
  }));

  const duplicateLocalLocales = targets
    .map(({ localLocale }) => localLocale)
    .filter((locale, index, locales) => locales.indexOf(locale) !== index);
  if (duplicateLocalLocales.length > 0) {
    throw new Error(`本地语言映射重复: ${[...new Set(duplicateLocalLocales)].join(', ')}`);
  }

  return {
    projectId,
    apiToken: requireNonEmptyString(raw.api_token, 'api_token'),
    branch: requireNonEmptyString(raw.branch, 'branch'),
    sourcePattern: requireNonEmptyString(fileConfig.source, 'files[0].source'),
    translationPattern: requireNonEmptyString(fileConfig.translation, 'files[0].translation'),
    targets,
  };
}
