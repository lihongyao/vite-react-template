// 此文件由脚本自动生成，请勿手动修改
import type React from 'react';

import Icon_adult from './adult';
import Icon_first_visit_frame from './first_visit_frame';
import type { SvgPathName } from './svgPath_all';

export { SVG_PATH_NAMES, isSvgPathName } from './svgPath_all';
export type { SvgPathName } from './svgPath_all';

export const SVG_COMPONENT_MAP = {
  adult: Icon_adult,
  first_visit_frame: Icon_first_visit_frame,
} as const satisfies Partial<
  Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>
>;

export const SVG_SPRITE_ID_MAP = {
  arrow_left: 'icon-arrow_left',
  close: 'icon-close',
  copy: 'icon-copy',
  edit: 'icon-edit',
  goods: 'icon-goods',
  tabbar_casino: 'icon-tabbar_casino',
  tabbar_home: 'icon-tabbar_home',
  tabbar_profile: 'icon-tabbar_profile',
  tabbar_sport: 'icon-tabbar_sport',
  tips_correct: 'icon-tips_correct',
  tips_error: 'icon-tips_error',
  tips_system: 'icon-tips_system',
  tips_warning: 'icon-tips_warning',
} as const satisfies Partial<Record<SvgPathName, string>>;

export const SVG_ICON_KIND_MAP = {
  adult: 'svgr',
  arrow_left: 'sprite',
  close: 'sprite',
  copy: 'sprite',
  edit: 'sprite',
  first_visit_frame: 'svgr',
  goods: 'sprite',
  tabbar_casino: 'sprite',
  tabbar_home: 'sprite',
  tabbar_profile: 'sprite',
  tabbar_sport: 'sprite',
  tips_correct: 'sprite',
  tips_error: 'sprite',
  tips_system: 'sprite',
  tips_warning: 'sprite',
} as const satisfies Record<SvgPathName, 'sprite' | 'svgr'>;
