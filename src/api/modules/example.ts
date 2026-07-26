/**
 * 普通请求和 skipAuth 登录请求示例。
 */
import { request } from '../client';

export interface AppInfo {
  name: string;
  version: string;
}

export interface LoginParams {
  password: string;
  username: string;
}

export interface LoginResult {
  token: string;
}

export function getInfos(signal?: AbortSignal) {
  return request<AppInfo>({
    method: 'GET',
    signal,
    url: '/api/infos',
  });
}

export function login(data: LoginParams, signal?: AbortSignal) {
  return request<LoginResult, LoginParams>({
    data,
    method: 'POST',
    signal,
    skipAuth: true, // 登录等公开接口显式跳过 Authorization。
    url: '/api/login',
  });
}
