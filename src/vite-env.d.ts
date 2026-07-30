interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  // 当前环境
  readonly VITE_APP_ENV: 'development' | 'qa' | 'production';
  // API 地址
  readonly VITE_API_BASE_URL: string;
  // 微信公众号 / 支付宝生活号 ID
  readonly VITE_APP_APPID_WEIXIN: string;
  readonly VITE_APP_APPID_ALIPAY: string;
  // 基础路径（如果你的项目需部署在二级目录请填写二级目录名，如：/appName/)
  readonly VITE_APP_BASE?: string;
  // 输出目录
  readonly VITE_OUT_DIR?: string;
  // 支持环境
  readonly VITE_APP_SOURCE: 'universal' | 'wechat' | 'telegram';
}
