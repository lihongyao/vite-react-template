import { request } from '../client';

export interface TelegramLoginParams {
  initData: string;
}

export interface TelegramLoginResult {
  token: string;
}

export function login(data: TelegramLoginParams, signal?: AbortSignal) {
  return request<TelegramLoginResult, TelegramLoginParams>({
    data,
    method: 'POST',
    signal,
    skipAuth: true,
    url: '/api/auth/telegram',
  });
}
