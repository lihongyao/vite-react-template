import fs from 'node:fs/promises';
import path from 'node:path';

import { createSvgSpriteBuilder } from '@neodx/svg';
import { format } from 'prettier';

import {
  PUBLIC_DIR,
  PUBLIC_SPRITE_PREFIX,
  PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE,
  ROOT_DIR,
  SVG_SOURCE_SPRITES_DIR,
} from './config.js';
import { assertUniqueSvgNames, readSvgSourceFiles } from './utils.js';

export type SpriteBuildResult = {
  publicSpriteFile: string;
  spriteNames: string[];
};

const SPRITE_FILE_PATTERN = /^sprite-icons(?:\.(?:[a-f0-9]{8}|empty))?\.svg$/;

function createPreviewHtml({ publicSpriteFile, spriteNames }: SpriteBuildResult): string {
  const list =
    spriteNames.length === 0
      ? '<p class="empty">当前没有可预览的 sprite 图标。</p>'
      : `<ul>${spriteNames
          .map(
            (name) => `
      <li class="item">
        <div class="icon-wrap">
          <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
            <use href="${publicSpriteFile}#icon-${name}"></use>
          </svg>
        </div>
        <code>${name}</code>
      </li>`,
          )
          .join('\n')}
    </ul>`;

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sprite 图标预览</title>
    <style>
      body { margin: 0; padding: 24px; background: #0f1115; color: #e5e7eb; font-family: ui-sans-serif, system-ui, sans-serif; }
      h1 { margin: 0 0 8px; font-size: 20px; }
      .desc { margin: 0 0 20px; color: #9ca3af; font-size: 13px; }
      ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
      .item { border: 1px solid #242833; border-radius: 8px; background: #171a21; padding: 12px; text-align: center; }
      .icon-wrap { width: 48px; height: 48px; margin: 0 auto 8px; border-radius: 6px; background: #0f1115; display: flex; align-items: center; justify-content: center; }
      .icon { width: 24px; height: 24px; color: #ffffff; fill: currentColor; }
      code { font-size: 12px; color: #cbd5e1; word-break: break-all; }
      .empty { color: #9ca3af; }
    </style>
  </head>
  <body>
    <h1>Sprite 图标预览</h1>
    <p class="desc">当前 sprite：<code>${publicSpriteFile}</code></p>
    ${list}
  </body>
</html>`;
}

async function removeOldSpriteFiles(): Promise<void> {
  const entries = await fs.readdir(PUBLIC_DIR, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && SPRITE_FILE_PATTERN.test(entry.name))
      .map((entry) => fs.rm(path.join(PUBLIC_DIR, entry.name), { force: true })),
  );
}

async function resolveLatestSpriteFile(): Promise<string> {
  const entries = await fs.readdir(PUBLIC_DIR, { withFileTypes: true });
  const files = entries.filter(
    (entry) =>
      entry.isFile() && SPRITE_FILE_PATTERN.test(entry.name) && !entry.name.includes('.empty.'),
  );
  if (files.length === 0) throw new Error(`未找到 ${PUBLIC_SPRITE_PREFIX} 对应的 sprite 文件`);
  if (files.length === 1) return files[0].name;

  const filesWithMtime = await Promise.all(
    files.map(async (file) => {
      const stat = await fs.stat(path.join(PUBLIC_DIR, file.name));
      return { name: file.name, mtimeMs: stat.mtimeMs };
    }),
  );
  return filesWithMtime.toSorted((a, b) => b.mtimeMs - a.mtimeMs)[0].name;
}

export async function generateSpriteSvg(): Promise<SpriteBuildResult> {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await removeOldSpriteFiles();

  const sourceFiles = await readSvgSourceFiles(SVG_SOURCE_SPRITES_DIR);
  assertUniqueSvgNames(sourceFiles, 'source/sprites');
  const spriteNames = sourceFiles.map((file) => file.name);

  if (spriteNames.length === 0) {
    const fileName = `${PUBLIC_SPRITE_PREFIX}.empty.svg`;
    const publicSpriteFile = `/${fileName}`;
    await fs.writeFile(
      path.join(PUBLIC_DIR, fileName),
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
      'utf8',
    );
    const result = { publicSpriteFile, spriteNames };
    await fs.writeFile(
      PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE,
      await format(createPreviewHtml(result), { parser: 'html' }),
      'utf8',
    );
    return result;
  }

  const builder = createSvgSpriteBuilder({
    inputRoot: path.relative(ROOT_DIR, SVG_SOURCE_SPRITES_DIR),
    output: path.relative(ROOT_DIR, PUBLIC_DIR),
    group: false,
    inline: false,
    defaultSpriteName: PUBLIC_SPRITE_PREFIX,
    fileName: '{name}.{hash:8}.svg',
    cleanup: false,
    resetColors: true,
    getSymbolName: (filePath: string) => `icon-${path.basename(filePath, '.svg')}`,
  });

  await builder.load('**/*.svg');
  await builder.build();

  const result = {
    publicSpriteFile: `/${await resolveLatestSpriteFile()}`,
    spriteNames,
  };
  await fs.writeFile(
    PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE,
    await format(createPreviewHtml(result), { parser: 'html' }),
    'utf8',
  );
  return result;
}
