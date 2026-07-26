/**
 * 响应、分页、请求配置类型。
 */
import type { AxiosRequestConfig } from 'axios';

export type ApiResponseMode = 'base-response' | 'json';

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export interface ApiRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  responseMode?: ApiResponseMode;
  skipAuth?: boolean;
}

export interface ApiRequestContext {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

export type ApiRequestContextProvider = () => ApiRequestContext;

export interface ListParams {
  page?: number;
  size?: number;
  [prop: string]: unknown;
}

export interface ListResponse<T> {
  items: T[];
  current: number;
  size: number;
  total_items: number;
  total_pages: number;
}
