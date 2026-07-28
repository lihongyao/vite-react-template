/**
 * Token 读写、401 去重通知、未授权回调注册。
 */
import type { ApiError } from './errors';

const AUTH_TOKEN_KEY = 'AUTHORIZATION_TOKEN';

type UnauthorizedHandler = (error: ApiError) => void;

let unauthorizedHandler: UnauthorizedHandler | undefined;
let unauthorizedNotified = false; // 多个并发请求同时返回 401 时，只触发一次退出或跳转流程。

export const authSession = {
  /**
   * 清除本地 Token，并重置 401 通知状态。
   */
  clearToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    unauthorizedNotified = false;
  },

  /**
   * 清除失效的 Token，并确保并发 401 只触发一次未授权回调。
   */
  expire(error: ApiError) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    if (unauthorizedNotified) return;

    unauthorizedNotified = true;
    unauthorizedHandler?.(error);
  },

  /**
   * 获取当前存储的 Token，不存在时返回 null。
   */
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * 保存新 Token，并允许后续鉴权失效再次触发未授权回调。
   */
  setToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    unauthorizedNotified = false; // 新会话建立后允许下一次鉴权失效重新通知。
  },

  /**
   * 注册未授权回调，并返回仅清理本次注册的函数。
   */
  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    unauthorizedHandler = handler;

    return () => {
      if (unauthorizedHandler === handler) unauthorizedHandler = undefined;
    };
  },
};
