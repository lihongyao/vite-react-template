/** 微信静默授权预留入口，后续在 Promise 完成前写入登录态。 */
export function authenticateWeChat(signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve();

  return Promise.resolve();
}
