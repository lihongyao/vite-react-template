/**
 * 统一 ApiError，区分业务、HTTP、网络、超时和取消错误。
 */
import { AxiosError, isAxiosError } from 'axios';

import type { ApiResponse } from './types';

export type ApiErrorKind = 'business' | 'canceled' | 'http' | 'network' | 'timeout' | 'unknown';

type ApiErrorOptions = {
  cause?: unknown;
  code?: number;
  details?: unknown;
  kind: ApiErrorKind;
  status?: number;
};

export class ApiError extends Error {
  readonly code?: number;
  readonly details?: unknown;
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, options: ApiErrorOptions) {
    super(message, { cause: options.cause });
    this.name = 'ApiError';
    this.code = options.code;
    this.details = options.details;
    this.kind = options.kind;
    this.status = options.status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readErrorPayload(payload: unknown) {
  if (!isRecord(payload)) return {};

  const code = typeof payload.code === 'number' ? payload.code : undefined;
  const message =
    typeof payload.msg === 'string'
      ? payload.msg
      : typeof payload.message === 'string'
        ? payload.message
        : undefined;

  return { code, message };
}

export function createBusinessError(response: ApiResponse<unknown>, status: number): ApiError {
  return new ApiError(response.msg || 'Request failed', {
    code: response.code,
    details: response.data,
    kind: 'business',
    status,
  });
}

export function normalizeApiError(error: unknown): ApiError {
  // 防止业务错误经过多层 request helper 时被重复包装。
  if (error instanceof ApiError) return error;

  if (!isAxiosError(error)) {
    return new ApiError(error instanceof Error ? error.message : 'Unknown request error', {
      cause: error,
      kind: 'unknown',
    });
  }

  const payload = readErrorPayload(error.response?.data);
  const status = error.response?.status;

  if (error.code === AxiosError.ERR_CANCELED) {
    return new ApiError('Request canceled', {
      cause: error,
      kind: 'canceled',
    });
  }

  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    return new ApiError('Request timed out', {
      cause: error,
      kind: 'timeout',
      status,
    });
  }

  if (!error.response) {
    // Axios 没有拿到响应时通常是断网、DNS 或跨域失败。
    return new ApiError('Network connection failed', {
      cause: error,
      kind: 'network',
    });
  }

  return new ApiError(payload.message || error.message || `HTTP ${status}`, {
    cause: error,
    code: payload.code,
    details: error.response.data,
    kind: 'http',
    status,
  });
}
