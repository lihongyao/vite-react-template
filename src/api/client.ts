/**
 * Axios 实例、Token、通用请求上下文、请求/响应拦截、业务数据解包、Blob 下载。
 */
import { type AxiosResponse, type InternalAxiosRequestConfig, create, isAxiosError } from 'axios';

import { authSession } from './auth-session';
import { createBusinessError, normalizeApiError } from './errors';
import type {
  ApiRequestConfig,
  ApiRequestContextProvider,
  ApiResponse,
  ApiResponseMode,
} from './types';

const API_SUCCESS_CODE = 200;
const API_UNAUTHORIZED_CODES = new Set([401]);

type InternalApiRequestConfig = InternalAxiosRequestConfig & {
  responseMode?: ApiResponseMode;
  skipAuth?: boolean;
};

type DownloadResult = {
  data: Blob;
  filename?: string;
};

const instance = create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
});

// 在发出请求时读取最新上下文，适合注入语言、渠道、appId 等动态公共信息。
let requestContextProvider: ApiRequestContextProvider | undefined;

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== 'object' || value === null) return false;

  const response = value as Partial<ApiResponse<unknown>>;
  return (
    typeof response.code === 'number' && 'data' in response && typeof response.msg === 'string'
  );
}

function isUnauthorized(error: ReturnType<typeof normalizeApiError>) {
  return (
    error.status === 401 || (error.code !== undefined && API_UNAUTHORIZED_CODES.has(error.code))
  );
}

function parseFilename(contentDisposition: string | undefined): string | undefined {
  if (!contentDisposition) return undefined;

  const encoded = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  }

  return contentDisposition
    .match(/filename=(?:"([^"]+)"|([^;]+))/i)
    ?.slice(1)
    .find(Boolean)
    ?.trim();
}

// 请求拦截器
instance.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const config = requestConfig as InternalApiRequestConfig;
    const context = requestContextProvider?.();
    const token = authSession.getToken();

    config.headers.set('Accept', 'application/json');
    for (const [name, value] of Object.entries(context?.headers ?? {})) {
      config.headers.set(name, value);
    }
    // 单个接口传入的参数优先级高于公共参数。
    if (context?.params) config.params = { ...context.params, ...config.params };
    if (token && !config.skipAuth) config.headers.set('Authorization', `Bearer ${token}`);

    return config;
  },
  (error: unknown) => {
    throw normalizeApiError(error);
  },
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 这里只归一化错误并继续抛出，避免调用方或 Query 将失败请求视为成功。
    const apiError = normalizeApiError(error);
    const requestConfig = isAxiosError(error)
      ? (error.config as InternalApiRequestConfig | undefined)
      : undefined;

    if (!requestConfig?.skipAuth && isUnauthorized(apiError)) authSession.expire(apiError);

    throw apiError;
  },
);

export function setApiRequestContextProvider(provider: ApiRequestContextProvider) {
  requestContextProvider = provider;

  return () => {
    if (requestContextProvider === provider) requestContextProvider = undefined;
  };
}

export async function request<T, D = unknown>(config: ApiRequestConfig<D>): Promise<T> {
  if (config.responseMode === 'json') {
    const response = await instance.request<T, AxiosResponse<T>, D>(config);
    return response.data;
  }

  const response = await instance.request<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(config);

  // 模板约定所有普通接口均返回 { code, data, msg }。
  if (!isApiResponse(response.data)) {
    throw normalizeApiError(new Error('Invalid API response envelope'));
  }

  if (response.data.code !== API_SUCCESS_CODE) {
    const apiError = createBusinessError(response.data, response.status);
    if (isUnauthorized(apiError)) authSession.expire(apiError);
    throw apiError;
  }

  // 业务层只接收真正的数据，避免到处重复判断 code 和解包 data。
  return response.data.data;
}

// 文件流不符合普通业务响应结构，因此保留 Blob 和响应头中的文件名。
export async function download<D = unknown>(config: ApiRequestConfig<D>): Promise<DownloadResult> {
  try {
    const response = await instance.request<Blob, AxiosResponse<Blob>, D>({
      ...config,
      responseType: 'blob',
    });

    return {
      data: response.data,
      filename: parseFilename(response.headers['content-disposition']),
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
