import type React from 'react';

import {
  SVG_COMPONENT_MAP,
  SVG_ICON_KIND_MAP,
  SVG_SPRITE_ID_MAP,
  type SvgPathName,
} from '@/assets/svg/generated';
import { cn } from '@/libs/class-helpers';

import { type IconName, isRemoteIconUrl } from './icon-name';

export type { IconName, RemoteIconUrl } from './icon-name';

export type IconProps = {
  /** 本地图标名称或 http(s) 远程图片地址。 */
  name: IconName;
  /** 远程单色 SVG 传入颜色后使用 CSS mask 渲染。 */
  color?: string;
  alt?: string;
  wrapperClass?: string;
} & Omit<React.SVGProps<SVGSVGElement>, 'color' | 'name' | 'onClick'>;

export default function Icon({
  name,
  color,
  style,
  className,
  wrapperClass,
  alt,
  ...rest
}: IconProps) {
  const isRemoteImage = isRemoteIconUrl(name);
  const isRemoteSvg = isRemoteImage && /\.svg(?:[?#]|$)/i.test(name);
  const svgName = isRemoteImage ? undefined : name;
  const componentMap = SVG_COMPONENT_MAP as Partial<
    Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>
  >;
  const spriteIdMap = SVG_SPRITE_ID_MAP as Partial<Record<SvgPathName, string>>;
  const iconKind = svgName ? SVG_ICON_KIND_MAP[svgName] : undefined;
  const SvgComponent = svgName ? componentMap[svgName] : undefined;
  const spriteId = svgName ? spriteIdMap[svgName] : undefined;
  const a11yProps = alt
    ? { role: 'img', 'aria-label': alt }
    : { 'aria-hidden': true, focusable: false as const };
  const iconStyle = {
    ...(color ? { color } : null),
    ...style,
  };

  return (
    <span
      data-name={svgName ?? 'remote-icon'}
      className={cn('inline-flex shrink-0 items-center justify-center text-[0px]', wrapperClass)}
    >
      {iconKind === 'svgr' && SvgComponent && (
        <SvgComponent {...rest} {...a11yProps} className={className} style={iconStyle} />
      )}
      {iconKind === 'sprite' && spriteId && (
        <svg {...rest} {...a11yProps} className={className} style={iconStyle}>
          <use href={`#${spriteId}`} />
        </svg>
      )}
      {isRemoteSvg && color && (
        <span
          role={alt ? 'img' : undefined}
          aria-label={alt}
          aria-hidden={alt ? undefined : true}
          className={cn('inline-block size-[1em] shrink-0', className)}
          style={{
            backgroundColor: color,
            WebkitMaskImage: `url("${name}")`,
            maskImage: `url("${name}")`,
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            ...style,
          }}
        />
      )}
      {isRemoteImage && (!isRemoteSvg || !color) && (
        <img
          src={name}
          className={cn('shrink-0', className)}
          style={style}
          alt={alt ?? ''}
          draggable={false}
        />
      )}
      {!iconKind && !isRemoteImage && (
        <span
          aria-hidden
          className={cn('inline-flex items-center justify-center text-xs', className)}
        >
          ?
        </span>
      )}
    </span>
  );
}
