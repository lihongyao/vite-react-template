/**
 * 响应、分页、请求配置类型。
 */
import type { AxiosRequestConfig } from 'axios';

export type ApiResponseMode = 'base-response' | 'json';
export type ApiErrorHandling = 'global' | 'manual';

/**
 * 响应格式
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

/**
 * 请求配置
 */
export interface ApiRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  // 默认由全局错误展示器处理；传 manual 时，请求仍会抛出错误，但不会弹全局提示。
  errorHandling?: ApiErrorHandling;
  // 响应格式，默认为 base-response
  responseMode?: ApiResponseMode;
  // 是否跳过鉴权（不需要 token 的接口）
  skipAuth?: boolean;
}

/**
 * 请求上下文
 */
export interface ApiRequestContext {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

/**
 * 请求上下文提供者
 */
export type ApiRequestContextProvider = () => ApiRequestContext;

/**
 * 分页参数
 */
export interface ListParams {
  page?: number;
  size?: number;
  [prop: string]: unknown;
}

/**
 * 分页响应
 */
export interface ListResponse<T> {
  items: T[];
  current: number;
  size: number;
  total_items: number;
  total_pages: number;
}
