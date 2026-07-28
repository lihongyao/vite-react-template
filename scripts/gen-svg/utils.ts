import fs from 'node:fs/promises';
import path from 'node:path';

export type SvgSourceFile = {
  filePath: string;
  name: string;
};

export function safeFileBase(originalBase: string): string {
  const normalized = originalBase.replace(/\\/g, '/');
  let safeName = normalized.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^\d/.test(safeName)) safeName = `_${safeName}`;
  return safeName;
}

export function componentNameFromOriginal(originalBase: string): string {
  const parts = originalBase
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let composed = parts.map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`).join('');
  if (!composed) composed = 'Icon';
  if (/^\d/.test(composed)) composed = `_${composed}`;
  return `Svg${composed}`;
}

async function collectSvgSourceFiles(dir: string): Promise<SvgSourceFile[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: SvgSourceFile[] = [];

  for (const entry of entries.toSorted((a, b) => a.name.localeCompare(b.name))) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSvgSourceFiles(filePath)));
      continue;
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.svg')) continue;
    files.push({ filePath, name: path.basename(entry.name, '.svg') });
  }

  return files;
}

export async function readSvgSourceFiles(dir: string): Promise<SvgSourceFile[]> {
  return (await collectSvgSourceFiles(dir)).toSorted((a, b) => a.name.localeCompare(b.name));
}

export function assertUniqueSvgNames(files: SvgSourceFile[], sourceLabel: string): void {
  const seenNames = new Map<string, string>();
  const seenSafeNames = new Map<string, string>();

  for (const file of files) {
    const duplicatePath = seenNames.get(file.name);
    if (duplicatePath) {
      throw new Error(
        `${sourceLabel} 存在同名图标 ${file.name}: ${duplicatePath}, ${file.filePath}`,
      );
    }
    seenNames.set(file.name, file.filePath);

    const safeName = safeFileBase(file.name);
    const safeDuplicatePath = seenSafeNames.get(safeName);
    if (safeDuplicatePath) {
      throw new Error(
        `${sourceLabel} 的文件名生成了相同的 TSX 名称 ${safeName}: ${safeDuplicatePath}, ${file.filePath}`,
      );
    }
    seenSafeNames.set(safeName, file.filePath);
  }
}

export async function removeOrphanedSvgrTsxFiles(
  dir: string,
  currentSourceBaseNames: string[],
  reservedBaseNames: string[] = [],
): Promise<string[]> {
  const expected = new Set([
    ...currentSourceBaseNames.map((name) => safeFileBase(name)),
    ...reservedBaseNames,
  ]);
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const removed: string[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.tsx')) continue;
    const base = path.basename(entry.name, '.tsx');
    if (expected.has(base)) continue;
    await fs.rm(path.join(dir, entry.name), { force: true });
    removed.push(entry.name);
  }

  return removed.toSorted((a, b) => a.localeCompare(b));
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}
