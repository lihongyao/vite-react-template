import type { ApiError } from './errors';
import type { ApiRequestConfig } from './types';

export interface ApiErrorHandlerContext {
  config?: ApiRequestConfig;
}

export type ApiErrorHandler = (error: ApiError, context: ApiErrorHandlerContext) => void;

let apiErrorHandler: ApiErrorHandler | undefined;

/**
 * API 层不直接依赖 React/UI 组件，只提供一个注册点。
 * 真正的 notification/dialog/i18n 展示逻辑由应用启动后的 React 组件注入。
 */
export function setApiErrorHandler(handler: ApiErrorHandler) {
  apiErrorHandler = handler;

  return () => {
    if (apiErrorHandler === handler) apiErrorHandler = undefined;
  };
}

/**
 * 展示 API 错误
 * @param error
 * @param context
 */
export function notifyApiError(error: ApiError, context: ApiErrorHandlerContext = {}) {
  try {
    apiErrorHandler?.(error, context);
  } catch (handlerError) {
    // 全局错误展示不能影响原请求错误继续向调用方抛出。
    console.error('Api error handler failed:', handlerError);
  }
}
