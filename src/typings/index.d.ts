export { };

declare global {
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
    /** iOS回调地址 */
    CONFIG_URL_FOR_IOS: string;
  }
}
