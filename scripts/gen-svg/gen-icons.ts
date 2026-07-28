import fs from 'node:fs/promises';
import path from 'node:path';

import { transform } from '@svgr/core';
import { format, resolveConfig } from 'prettier';

import { INLINE_SPRITE_COMPONENT_BASE, SVG_GENERATED_DIR, SVG_SOURCE_SVGRS_DIR } from './config.js';
import { optimizeSvgContent } from './optimize-svgo.js';
import {
  assertUniqueSvgNames,
  componentNameFromOriginal,
  fileExists,
  readSvgSourceFiles,
  removeOrphanedSvgrTsxFiles,
  safeFileBase,
} from './utils.js';

export type GenerateSvgrResult = {
  names: string[];
  stats: {
    created: string[];
    removed: string[];
    skipped: string[];
  };
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureUniqueSvgIds(tsxCode: string): string {
  const ids = [
    ...new Set(Array.from(tsxCode.matchAll(/\bid=(["'])(.*?)\1/g), (match) => match[2])),
  ];
  if (ids.length === 0) return tsxCode;

  const usedVarNames = new Set<string>();
  const idVarMap = new Map<string, string>();
  for (const id of ids) {
    const baseName = safeFileBase(id).replace(/^_+/, '') || 'svgDef';
    let varName = `${baseName}Id`;
    let suffix = 2;
    while (usedVarNames.has(varName)) {
      varName = `${baseName}Id${suffix}`;
      suffix += 1;
    }
    usedVarNames.add(varName);
    idVarMap.set(id, varName);
  }

  let nextCode = tsxCode.replace(
    /import\s+type\s+\{\s*SVGProps\s*\}\s+from\s+['"]react['"];?/,
    "import { useId, type SVGProps } from 'react';",
  );

  for (const [id, varName] of idVarMap) {
    const escapedId = escapeRegExp(id);
    nextCode = nextCode.replace(new RegExp(`id=(["'])${escapedId}\\1`, 'g'), `id={${varName}}`);
    nextCode = nextCode.replace(
      new RegExp(`=(["'])url\\(#${escapedId}\\)\\1`, 'g'),
      `={\`url(#$\{${varName}})\`}`,
    );
    nextCode = nextCode.replace(
      new RegExp(`=(["'])#${escapedId}\\1`, 'g'),
      `={\`#$\{${varName}}\`}`,
    );
  }

  const declarations = [
    "const idPrefix = useId().replace(/:/g, '');",
    ...Array.from(idVarMap.entries()).map(
      ([id, varName]) => `const ${varName} = idPrefix + ${JSON.stringify(`-${id}`)};`,
    ),
  ].join('\n  ');

  nextCode = nextCode.replace(
    /const\s+(\w+)\s*=\s*\(props: SVGProps<SVGSVGElement>\)\s*=>\s*\(\n/,
    `const $1 = (props: SVGProps<SVGSVGElement>) => {\n  ${declarations}\n\n  return (\n`,
  );
  nextCode = nextCode.replace(
    /\n\);\nexport default\s+(\w+);?\s*$/,
    '\n  );\n};\nexport default $1;\n',
  );
  return nextCode;
}

export async function generateSvgrComponents(): Promise<GenerateSvgrResult> {
  const sourceFiles = await readSvgSourceFiles(SVG_SOURCE_SVGRS_DIR);
  assertUniqueSvgNames(sourceFiles, 'source/svgrs');
  const names = sourceFiles.map((file) => file.name);
  const prettierConfig =
    (await resolveConfig(path.join(SVG_GENERATED_DIR, '__generated__.tsx'))) ?? {};

  await fs.mkdir(SVG_GENERATED_DIR, { recursive: true });
  const removed = await removeOrphanedSvgrTsxFiles(SVG_GENERATED_DIR, names, [
    INLINE_SPRITE_COMPONENT_BASE,
  ]);
  const created: string[] = [];
  const skipped: string[] = [];

  for (const sourceFile of sourceFiles) {
    const safeBase = safeFileBase(sourceFile.name);
    const tsxPath = path.join(SVG_GENERATED_DIR, `${safeBase}.tsx`);
    if (await fileExists(tsxPath)) {
      skipped.push(sourceFile.name);
      continue;
    }

    const rawSvg = await fs.readFile(sourceFile.filePath, 'utf8');
    const tsxCode = await transform(
      optimizeSvgContent(rawSvg, sourceFile.filePath),
      {
        typescript: true,
        icon: true,
        prettier: false,
        expandProps: 'end',
        plugins: ['@svgr/plugin-jsx'],
        jsxRuntime: 'automatic',
      },
      { componentName: componentNameFromOriginal(sourceFile.name) },
    );
    const baseFormatted = await format(tsxCode, {
      ...prettierConfig,
      parser: 'typescript',
    });
    const formatted = await format(ensureUniqueSvgIds(baseFormatted), {
      ...prettierConfig,
      parser: 'typescript',
    });
    await fs.writeFile(tsxPath, formatted, 'utf8');
    created.push(sourceFile.name);
  }

  return { names, stats: { created, removed, skipped } };
}
