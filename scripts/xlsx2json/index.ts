/**
 * scripts/xlsx2json/index.ts
 * Excel → JSON 翻译导出脚本
 * 安装依赖：pnpm add -D xlsx tsx
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// xlsx 0.18 exposes its CommonJS API as the runtime default export.
// oxlint-disable-next-line import/default
import XLSX from 'xlsx';

// oxlint-disable-next-line import/no-named-as-default-member
const { readFile, utils } = XLSX;

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

// === 1. 可配置变量 ===
const EXCEL_FILE_NAME = 'translations.xlsx';
const SHEET_NAME = 'Sheet1';
const ROOT = path.resolve(scriptDirectory, '../../');
const INPUT_DIR = path.join(ROOT, 'scripts/xlsx2json');
const OUTPUT_DIR = path.join(ROOT, 'src/i18n/locales');
const SOURCE_LOCALE = 'zh';
const TARGET_LOCALES = ['en', 'pt', 'es'] as const;
const CONFIGURED_LOCALES = [SOURCE_LOCALE, ...TARGET_LOCALES] as const;

// === 2. 类型定义 ===
interface ExcelRow {
  /** 翻译 key */
  key?: unknown;
  /** 备注（可选） */
  remark?: unknown;
  /** 语言列 */
  [lang: string]: unknown;
}

type NestedObject = {
  [key: string]: string | NestedObject;
};

function normalizeCellValue(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  return '';
}

// === 3. 读取 Excel 文件 ===
const excelPath = path.join(INPUT_DIR, EXCEL_FILE_NAME);
console.log(`📂 读取 Excel 文件: ${excelPath}`);

const workbook = readFile(excelPath);
const sheet = SHEET_NAME ? workbook.Sheets[SHEET_NAME] : workbook.Sheets[workbook.SheetNames[0]];

if (!sheet) throw new Error(`❌ 找不到 Excel sheet: ${SHEET_NAME}`);
console.log(`📄 使用 Sheet: ${SHEET_NAME || workbook.SheetNames[0]}`);

const rawData: ExcelRow[] = utils.sheet_to_json(sheet);
console.log(`🔑 Excel 共读取 ${rawData.length} 条记录`);

// === 4. 校验语言配置和 Excel 表头 ===
const configuredLocaleSet = new Set<string>(CONFIGURED_LOCALES);
if (configuredLocaleSet.size !== CONFIGURED_LOCALES.length) {
  throw new Error('❌ 源语言和目标语言不能重复');
}

const rowsWithHeader: unknown[][] = utils.sheet_to_json(sheet, {
  blankrows: false,
  defval: '',
  header: 1,
});
const excelHeaders = (rowsWithHeader[0] || []).map(normalizeCellValue);
const duplicateHeaders = excelHeaders.filter(
  (header, index) => header && excelHeaders.indexOf(header) !== index,
);
if (duplicateHeaders.length > 0) {
  throw new Error(`❌ Excel 存在重复列: ${[...new Set(duplicateHeaders)].join(', ')}`);
}

const requiredHeaders = ['key', ...CONFIGURED_LOCALES];
const missingHeaders = requiredHeaders.filter((header) => !excelHeaders.includes(header));
if (missingHeaders.length > 0) {
  throw new Error(`❌ Excel 缺少必需列: ${missingHeaders.join(', ')}`);
}

console.log(`🌐 源语言: ${SOURCE_LOCALE}`);
console.log(`🎯 目标语言: ${TARGET_LOCALES.join(', ')}`);

// === 5. 递归写入对象属性 ===
function setNested(obj: NestedObject, keyPath: string, value: string) {
  const keys = keyPath.split('.');
  let current: NestedObject = obj;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      current[k] = value;
    } else {
      const existingValue = current[k];
      if (typeof existingValue === 'object') {
        current = existingValue;
      } else {
        const nestedValue: NestedObject = {};
        current[k] = nestedValue;
        current = nestedValue;
      }
    }
  });
}

// === 6. 初始化结果对象和计数器 ===
const result: Record<string, NestedObject> = {};
const translatedCounts: Record<string, number> = {};
const fallbackCounts: Record<string, number> = {};
let sourceCount = 0;

CONFIGURED_LOCALES.forEach((lang) => {
  result[lang] = {};
});
TARGET_LOCALES.forEach((lang) => {
  translatedCounts[lang] = 0;
  fallbackCounts[lang] = 0;
});

// === 7. 处理每一行数据 ===
const missingSourceKeys: string[] = [];

rawData.forEach((row) => {
  const key = normalizeCellValue(row.key);
  if (!key) return; // 没有 key 整行跳过

  const sourceValue = normalizeCellValue(row[SOURCE_LOCALE]);
  if (!sourceValue) {
    missingSourceKeys.push(key);
    return;
  }

  setNested(result[SOURCE_LOCALE], key, sourceValue);
  sourceCount += 1;

  TARGET_LOCALES.forEach((lang) => {
    const translatedValue = normalizeCellValue(row[lang]);
    const value = translatedValue || sourceValue;
    setNested(result[lang], key, value);

    if (translatedValue) {
      translatedCounts[lang] += 1;
    } else {
      fallbackCounts[lang] += 1;
    }
  });
});

if (missingSourceKeys.length > 0) {
  throw new Error(`❌ 以下 key 缺少源语言 ${SOURCE_LOCALE} 文案: ${missingSourceKeys.join(', ')}`);
}

// === 8. 输出 JSON 文件并显示提示 ===
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log(`🧹 创建输出目录: ${OUTPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} else {
  console.log(`🧹 清空输出目录下文件: ${OUTPUT_DIR}`);
  const files = fs.readdirSync(OUTPUT_DIR);
  files.forEach((file) => {
    const filePath = path.join(OUTPUT_DIR, file);
    if (fs.lstatSync(filePath).isFile()) {
      fs.unlinkSync(filePath); // 删除文件
    }
  });
}

CONFIGURED_LOCALES.forEach((lang) => {
  const filePath = path.join(OUTPUT_DIR, `${lang}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(result[lang], null, 2)}\n`, 'utf8');

  if (lang === SOURCE_LOCALE) {
    console.log(`✅ [${lang}] 文件生成: ${filePath}，共 ${sourceCount} 条源文案`);
  } else {
    console.log(
      `✅ [${lang}] 文件生成: ${filePath}，${translatedCounts[lang]} 条已翻译，${fallbackCounts[lang]} 条回退到 ${SOURCE_LOCALE}`,
    );
  }
});

console.log(`🎉 转换完成，共生成 ${CONFIGURED_LOCALES.length} 个语言文件`);
console.log(`📂 输出目录: ${OUTPUT_DIR}`);
