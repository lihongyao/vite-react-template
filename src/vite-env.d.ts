interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'development' | 'qa' | 'production';
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_APPID_WEIXIN: string;
  readonly VITE_APP_APPID_ALIPAY: string;
  readonly VITE_APP_BASE?: string;
  readonly VITE_OUT_DIR?: string;
  readonly VITE_APP_SOURCE: 'universal' | 'wechat' | 'telegram';
}
