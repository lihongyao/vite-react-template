/*
 * @Author: Lee
 * @Date: 2021-08-31 15:50:32
 * @LastEditors: Lee
 * @LastEditTime: 2022-04-19 13:58:44
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // -- 当前环境
  readonly VITE_APP_ENV: string;
  // -- 输出目录
  readonly VITE_OUT_DIR: string;
  // -- 基础路径
  readonly VITE_APP_BASE: string;
  // -- 接口地址
  readonly VITE_APP_HOST: string;
  // -- 项目源
  readonly VITE_APP_SOURCE: string;
  // -- APP IDs
  readonly VITE_APP_APPID_WEIXIN: string;
  readonly VITE_APP_APPID_ALIPAY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
