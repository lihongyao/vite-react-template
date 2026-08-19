import type { ApiError, ApiErrorHandlerContext } from '@/api';
import type { TipsType } from '@/components/features/dialogs/types';

export type ApiErrorMessageVariables = Record<string, boolean | number | string | null | undefined>;

type ApiErrorMessageValueResolver = (details: unknown, error: ApiError) => ApiErrorMessageVariables;

export interface ApiErrorTipsRule {
  cancelText?: string | null;
  cancelTextKey?: string;
  confirmText?: string;
  confirmTextKey?: string;
  description?: string;
  descriptionKey?: string;
  maskClosable?: boolean;
  onCancel?: (error: ApiError, context: ApiErrorHandlerContext) => Promise<void> | void;
  onConfirm?: (error: ApiError, context: ApiErrorHandlerContext) => Promise<void> | void;
  title?: string;
  titleKey?: string;
  type?: TipsType;
}

const ERROR_MESSAGE_VALUE_RESOLVERS: Partial<Record<number, ApiErrorMessageValueResolver>> = {
  // 优先推动后端 data key 与翻译变量一致：{ data: { time } } -> {{time}}。
  // 这里兼容一些历史/非标准命名，后续只有“变量不匹配或需要格式化”的错误码才需要新增。
  1203: (details) => {
    const source = getVariableSource(details);
    const minutes = readFirstValue(source, [
      'time',
      'minutes',
      'waitMinutes',
      'remainingMinutes',
      'remainingTime',
      'remaining_time',
    ]);
    const seconds = readFirstNumber(source, ['seconds', 'remainingSeconds', 'remaining_seconds']);

    return {
      time: minutes ?? (seconds === undefined ? undefined : Math.ceil(seconds / 60)),
    };
  },
};

// 需要 Dialog Tips 承载后续动作的错误码放这里。
// 只建议放真正需要“确认/取消/跳转/补充操作”的错误码；普通错误交给 notification。
// 例：
// 1301: {
//   type: 'warning',
//   confirmTextKey: 'common.goVerify',
//   cancelText: null,
//   onConfirm: () => router.navigate('/verify'),
// }
export const ERROR_TIPS_RULES: Partial<Record<number, ApiErrorTipsRule>> = {};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getVariableSource(details: unknown): Record<string, unknown> {
  if (!isRecord(details)) return {};

  const nestedData = details.data;

  // business 错误 details 通常就是 data；HTTP 非 2xx 可能是完整 envelope：{ code, data, message }。
  if (isRecord(nestedData) && ('code' in details || 'message' in details)) {
    return nestedData;
  }

  return details;
}

function readFirstValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
  }

  return undefined;
}

function readFirstNumber(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }

  return undefined;
}

function toMessageVariables(source: Record<string, unknown>): ApiErrorMessageVariables {
  return Object.entries(source).reduce<ApiErrorMessageVariables>((variables, [key, value]) => {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null ||
      value === undefined
    ) {
      variables[key] = value;
    }

    return variables;
  }, {});
}

export function getApiErrorMessageVariables(error: ApiError): ApiErrorMessageVariables {
  const resolver = error.code === undefined ? undefined : ERROR_MESSAGE_VALUE_RESOLVERS[error.code];

  if (resolver) return resolver(error.details, error);

  return toMessageVariables(getVariableSource(error.details));
}

export function getApiErrorTipsRule(error: ApiError) {
  return error.code === undefined ? undefined : ERROR_TIPS_RULES[error.code];
}
