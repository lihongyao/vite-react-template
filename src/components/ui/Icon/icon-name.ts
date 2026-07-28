import { type SvgPathName, isSvgPathName } from '@/assets/svg/generated';

export type RemoteIconUrl = `http://${string}` | `https://${string}`;
export type IconName = SvgPathName | RemoteIconUrl;

export function isRemoteIconUrl(value: string): value is RemoteIconUrl {
  return /^https?:\/\//i.test(value);
}

export function isIconName(value: string): value is IconName {
  return isSvgPathName(value) || isRemoteIconUrl(value);
}
