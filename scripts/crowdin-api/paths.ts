import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));

// 路径从脚本位置反推项目根目录，不依赖命令执行时的 cwd。
export const PROJECT_ROOT = resolve(scriptDirectory, '../..');
export const CROWDIN_CONFIG_PATH = join(PROJECT_ROOT, 'crowdin.yml');
export const SOURCE_DIR = join(PROJECT_ROOT, 'src/i18n/source');
export const DOWNLOADS_DIR = join(PROJECT_ROOT, 'src/i18n/downloads');
export const LOCALES_DIR = join(PROJECT_ROOT, 'src/i18n/locales');
export const SOURCE_LOCALE = 'zh-CN';
