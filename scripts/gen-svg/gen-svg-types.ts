import fs from 'node:fs/promises';
import path from 'node:path';

import { format, resolveConfig } from 'prettier';

import { ICON_REGISTRY_OUTPUT_FILE, SVG_TYPES_OUTPUT_FILE } from './config.js';
import { safeFileBase } from './utils.js';

function assertNoDuplicatedNames(spriteNames: string[], svgrNames: string[]): void {
  const spriteSet = new Set(spriteNames);
  const duplicated = svgrNames.filter((name) => spriteSet.has(name)).toSorted();
  if (duplicated.length > 0) {
    throw new Error(`sprites 与 svgrs 存在同名图标：${duplicated.join(', ')}`);
  }
}

export async function generateSvgTypesAndRegistry({
  spriteNames,
  svgrNames,
}: {
  spriteNames: string[];
  svgrNames: string[];
}): Promise<void> {
  assertNoDuplicatedNames(spriteNames, svgrNames);
  const allNames = [...spriteNames, ...svgrNames].toSorted((a, b) => a.localeCompare(b));
  const typePrettierConfig = (await resolveConfig(SVG_TYPES_OUTPUT_FILE)) ?? {};
  const typeOutput = `
// 此文件由脚本自动生成，请勿手动修改

export const SVG_PATH_NAMES = [
  ${allNames.map((name) => `'${name}'`).join(',\n  ')}
] as const;

export type SvgPathName = (typeof SVG_PATH_NAMES)[number];

const SVG_PATH_NAME_SET: ReadonlySet<string> = new Set(SVG_PATH_NAMES);

export function isSvgPathName(value: string): value is SvgPathName {
  return SVG_PATH_NAME_SET.has(value);
}
`;

  await fs.mkdir(path.dirname(SVG_TYPES_OUTPUT_FILE), { recursive: true });
  await fs.writeFile(
    SVG_TYPES_OUTPUT_FILE,
    await format(typeOutput, { ...typePrettierConfig, parser: 'typescript' }),
    'utf8',
  );

  const imports = svgrNames.map((name) => {
    const fileName = safeFileBase(name);
    return `import Icon_${fileName} from './${fileName}';`;
  });
  const componentEntries = svgrNames.map((name) => {
    const fileName = safeFileBase(name);
    return `  '${name}': Icon_${fileName},`;
  });
  const spriteEntries = spriteNames.map((name) => `  '${name}': 'icon-${name}',`);
  const kindEntries = allNames.map(
    (name) => `  '${name}': '${spriteNames.includes(name) ? 'sprite' : 'svgr'}',`,
  );
  const registryPrettierConfig = (await resolveConfig(ICON_REGISTRY_OUTPUT_FILE)) ?? {};
  const registryOutput = `
// 此文件由脚本自动生成，请勿手动修改
import type React from 'react';

export { SVG_PATH_NAMES, isSvgPathName } from './svgPath_all';
export type { SvgPathName } from './svgPath_all';

import type { SvgPathName } from './svgPath_all';

${imports.join('\n')}

export const SVG_COMPONENT_MAP = {
${componentEntries.join('\n')}
} as const satisfies Partial<Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>>;

export const SVG_SPRITE_ID_MAP = {
${spriteEntries.join('\n')}
} as const satisfies Partial<Record<SvgPathName, string>>;

export const SVG_ICON_KIND_MAP = {
${kindEntries.join('\n')}
} as const satisfies Record<SvgPathName, 'sprite' | 'svgr'>;
`;

  await fs.writeFile(
    ICON_REGISTRY_OUTPUT_FILE,
    await format(registryOutput, { ...registryPrettierConfig, parser: 'typescript' }),
    'utf8',
  );
}
