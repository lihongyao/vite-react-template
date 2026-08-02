/**
 * Axios 实例、Token、通用请求上下文、请求/响应拦截、业务数据解包、Blob 下载。
 */
import { type AxiosResponse, type InternalAxiosRequestConfig, create } from 'axios';

import { authSession } from './auth-session';
import { notifyApiError } from './error-handler';
import { createBusinessError, normalizeApiError } from './errors';
import type {
  ApiRequestConfig,
  ApiRequestContextProvider,
  ApiResponse,
  ApiResponseMode,
} from './types';

type InternalApiRequestConfig = InternalAxiosRequestConfig & {
  errorHandling?: ApiRequestConfig['errorHandling'];
  responseMode?: ApiResponseMode;
  skipAuth?: boolean;
};

type DownloadResult = {
  data: Blob;
  filename?: string;
};

const API_SUCCESS_CODE = 200;
const API_UNAUTHORIZED_CODES = new Set([401]);

const instance = create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
});

// 在发出请求时读取最新上下文，适合注入语言、渠道、appId 等动态公共信息。
let requestContextProvider: ApiRequestContextProvider | undefined;

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
    throw apiError;
  },
);

/**
 * 注册动态请求上下文提供者。
 *
 * 每次请求发出前都会读取最新的上下文，可用于注入语言、渠道和 appId 等公共信息。
 *
 * @param provider 返回当前请求公共上下文的函数。
 * @returns 取消本次注册的清理函数。
 */
export function setApiRequestContextProvider(provider: ApiRequestContextProvider) {
  requestContextProvider = provider;

  return () => {
    if (requestContextProvider === provider) requestContextProvider = undefined;
  };
}

/**
 * 发送普通 API 请求，并返回业务数据。
 *
 * 默认会校验并解包“{ code, data, message }”响应；
 * 将“responseMode”设为“json”时，则直接返回服务端响应体。请求错误会统一归一化，并按配置触发全局错误提示。
 *
 * @typeParam T 业务响应数据类型。
 * @typeParam D 请求体数据类型。
 * @param config Axios 请求配置及 API 扩展配置。
 * @returns 业务响应数据，或“json”模式下的原始响应体。
 * @throws {ApiError} 请求失败、响应格式无效或业务状态码不成功时抛出。
 */
export async function request<T, D = unknown>(config: ApiRequestConfig<D>): Promise<T> {
  try {
    if (config.responseMode === 'json') {
      const response = await instance.request<T, AxiosResponse<T>, D>(config);
      return response.data;
    }

    const response = await instance.request<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(
      config,
    );

    // 模板约定所有普通接口均返回 { code, data, message }。
    if (!isApiResponse(response.data)) {
      throw normalizeApiError(new Error('Invalid API response envelope'));
    }

    if (response.data.code !== API_SUCCESS_CODE) {
      throw createBusinessError(response.data, response.status);
    }

    // 业务层只接收真正的数据，避免到处重复判断 code 和解包 data。
    return response.data.data;
  } catch (error) {
    throw handleRequestError(error, config);
  }
}

/**
 * 下载文件流，并从响应头中解析文件名。
 *
 * 文件流不符合普通业务响应结构，因此保留原始“Blob”和响应头中的文件名。
 *
 * @typeParam D 请求体数据类型。
 * @param config Axios 请求配置及 API 扩展配置。
 * @returns 包含文件数据和可选文件名的下载结果。
 * @throws {ApiError} 下载失败时抛出归一化后的 API 错误。
 */
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
    throw handleRequestError(error, config);
  }
}

/**
 * 判断未知值是否符合基础 API 响应信封格式。
 *
 * @param value 待校验的响应值。
 * @returns 值是否包含数值类型的“code”、任意类型的“data”和字符串类型的“message”。
 */
function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== 'object' || value === null) return false;

  const response = value as Partial<ApiResponse<unknown>>;
  return (
    typeof response.code === 'number' && 'data' in response && typeof response.message === 'string'
  );
}

/**
 * 判断归一化后的错误是否表示鉴权失效。
 *
 * @param error 待判断的 API 错误。
 * @returns 错误是否对应 HTTP 401 或约定的未授权业务码。
 */
function isUnauthorized(error: ReturnType<typeof normalizeApiError>) {
  return (
    error.status === 401 || (error.code !== undefined && API_UNAUTHORIZED_CODES.has(error.code))
  );
}

/**
 * 判断错误是否需要交给全局错误提示器展示。
 *
 * 取消请求、手动处理的请求和鉴权失效错误不触发普通 API 错误通知。
 *
 * @param error 归一化后的 API 错误。
 * @param config 当前请求配置；没有关联请求时可省略。
 * @returns 是否应触发全局错误提示。
 */
function shouldReportApiError(
  error: ReturnType<typeof normalizeApiError>,
  config: ApiRequestConfig | undefined,
) {
  // 取消请求属于用户/路由生命周期行为，不应该打扰用户。
  if (error.kind === 'canceled') return false;
  // 表单校验、局部状态兜底等场景可由调用方自己 catch 并展示。
  if (config?.errorHandling === 'manual') return false;
  // 401 继续走 authSession 的失效流程，避免同时弹普通错误通知。
  if (!config?.skipAuth && isUnauthorized(error)) return false;

  return true;
}

/**
 * 处理请求最终错误出口中的归一化、鉴权失效和全局提示逻辑。
 *
 * @param error 原始异常值。
 * @param config 当前请求配置；没有关联请求时可省略。
 * @returns 归一化后的 API 错误，供调用方继续抛出。
 */
function handleRequestError(error: unknown, config?: ApiRequestConfig) {
  const apiError = normalizeApiError(error);

  // 这里是 request/download 的最终出口：既保证错误继续 throw，也负责触发统一展示。
  if (!config?.skipAuth && isUnauthorized(apiError)) authSession.expire(apiError);
  if (shouldReportApiError(apiError, config)) notifyApiError(apiError, { config });

  return apiError;
}

/**
 * 从“Content-Disposition”响应头中解析文件名。
 *
 * 优先处理 RFC 5987 的“filename*”编码格式，再兼容普通“filename”格式。
 *
 * @param contentDisposition “Content-Disposition”响应头值。
 * @returns 解码后的文件名；响应头缺失或未包含文件名时返回“undefined”。
 */
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
