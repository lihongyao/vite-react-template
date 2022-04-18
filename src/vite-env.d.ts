/*
 * @Author: Lee
 * @Date: 2021-08-31 15:50:32
 * @LastEditors: Lee
 * @LastEditTime: 2022-04-18 14:13:59
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_APP_BASE: string;
  readonly VITE_APP_HOST: string;
  readonly VITE_APP_SOURCE: string;
  readonly VITE_APP_APPID_WEIXIN: string;
  readonly VITE_APP_APPID_ALIPAY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
