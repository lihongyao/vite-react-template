// 此文件由脚本自动生成，请勿手动修改

export const SVG_PATH_NAMES = [
  'adult',
  'arrow_left',
  'close',
  'copy',
  'edit',
  'first_visit_frame',
  'goods',
  'tabbar_casino',
  'tabbar_home',
  'tabbar_menu',
  'tabbar_profile',
  'tabbar_sport',
  'tips_correct',
  'tips_error',
  'tips_system',
  'tips_warning',
] as const;

export type SvgPathName = (typeof SVG_PATH_NAMES)[number];

const SVG_PATH_NAME_SET: ReadonlySet<string> = new Set(SVG_PATH_NAMES);

export function isSvgPathName(value: string): value is SvgPathName {
  return SVG_PATH_NAME_SET.has(value);
}
