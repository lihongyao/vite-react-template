/**
 * 统一导出入口
 */
export { authSession } from './auth-session';
export { download, request, setApiRequestContextProvider } from './client';
export { setApiErrorHandler } from './error-handler';
export { ApiError, normalizeApiError } from './errors';
export * as exampleApi from './modules/example';
export * as productApi from './modules/product';
export * as telegramAuthApi from './modules/telegram-auth';
export type { ApiErrorHandler, ApiErrorHandlerContext } from './error-handler';
export type * from './types';
