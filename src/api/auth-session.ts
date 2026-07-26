/**
 * Token 读写、401 去重通知、未授权回调注册。
 */
import type { ApiError } from './errors';

const AUTH_TOKEN_KEY = 'AUTHORIZATION_TOKEN';

type UnauthorizedHandler = (error: ApiError) => void;

let unauthorizedHandler: UnauthorizedHandler | undefined;
// 多个并发请求同时返回 401 时，只触发一次退出或跳转流程。
let unauthorizedNotified = false;

function getStorage(): Storage | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}

function removeStoredToken() {
  getStorage()?.removeItem(AUTH_TOKEN_KEY);
}

export const authSession = {
  clearToken() {
    removeStoredToken();
    unauthorizedNotified = false;
  },

  expire(error: ApiError) {
    removeStoredToken();
    if (unauthorizedNotified) return;

    unauthorizedNotified = true;
    unauthorizedHandler?.(error);
  },

  getToken() {
    return getStorage()?.getItem(AUTH_TOKEN_KEY) ?? null;
  },

  setToken(token: string) {
    getStorage()?.setItem(AUTH_TOKEN_KEY, token);
    // 新会话建立后允许下一次鉴权失效重新通知。
    unauthorizedNotified = false;
  },

  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    unauthorizedHandler = handler;

    return () => {
      if (unauthorizedHandler === handler) unauthorizedHandler = undefined;
    };
  },
};
