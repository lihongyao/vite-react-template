import path from 'node:path';

export const ROOT_DIR = process.cwd();

export const SVG_ROOT_DIR = path.join(ROOT_DIR, 'src/assets/svg');
export const SVG_SOURCE_DIR = path.join(SVG_ROOT_DIR, 'source');
export const SVG_SOURCE_SPRITES_DIR = path.join(SVG_SOURCE_DIR, 'sprites');
export const SVG_SOURCE_SVGRS_DIR = path.join(SVG_SOURCE_DIR, 'svgrs');
export const SVG_GENERATED_DIR = path.join(SVG_ROOT_DIR, 'generated');

export const INLINE_SPRITE_COMPONENT_BASE = 'sprite-svg';
export const INLINE_SPRITE_COMPONENT_OUTPUT_FILE = path.join(
  SVG_GENERATED_DIR,
  `${INLINE_SPRITE_COMPONENT_BASE}.tsx`,
);
export const ICON_REGISTRY_OUTPUT_FILE = path.join(SVG_GENERATED_DIR, 'index.ts');
export const SVG_TYPES_OUTPUT_FILE = path.join(SVG_GENERATED_DIR, 'svgPath_all.ts');

export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
export const PUBLIC_SPRITE_PREFIX = 'sprite-icons';
export const PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE = path.join(PUBLIC_DIR, 'sprite-preview.html');
