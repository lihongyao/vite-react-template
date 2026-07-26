import { request } from '../client';

export interface TelegramLoginParams {
  initData: string;
}

export interface TelegramLoginResult {
  token: string;
}

let loginPromise: Promise<TelegramLoginResult> | undefined;

function login(data: TelegramLoginParams) {
  return request<TelegramLoginResult, TelegramLoginParams>({
    data,
    method: 'POST',
    skipAuth: true,
    url: '/api/auth/telegram',
  });
}

export function loginOnce(data: TelegramLoginParams) {
  loginPromise ??= login(data).catch((error: unknown) => {
    loginPromise = undefined;
    throw error;
  });

  return loginPromise;
}
