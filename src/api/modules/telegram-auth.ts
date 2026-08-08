import { request } from '../client';

export interface TelegramLoginParams {
  initData: string;
}

export interface TelegramLoginResult {
  token: string;
}

export function login(data: TelegramLoginParams) {
  return request<TelegramLoginResult, TelegramLoginParams>({
    data,
    method: 'POST',
    skipAuth: true,
    url: '/api/auth/telegram',
  });
}
