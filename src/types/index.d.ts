// 👉 定义全局属性
interface Window {
  /** 百度统计 */
  _hmt: any;
  /** 微信S*/
  wx: any;
  /** 百度地图 */
  AMap: any;
  /** 腾讯地图 */
  qq: any;
  /** 支付宝 */
  AlipayJSBridge: any;
  /** Telegram Mini App */
  Telegram?: {
    // https://core.telegram.org/bots/webapps
    WebApp?: {
      initData?: string;
      platform?: string;
      ready?: () => void;
      close?: () => void;
    };
  };
  /** iOS回调地址 */
  CONFIG_URL_FOR_IOS: string;
}
