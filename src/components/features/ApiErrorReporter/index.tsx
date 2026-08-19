import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { type ApiError, type ApiErrorHandlerContext, setApiErrorHandler } from '@/api';
import { useDialog } from '@/components/features/dialogs/context';
import type { DialogContextValue } from '@/components/features/dialogs/context';
import { notification } from '@/components/ui/Notification';
import type { NotificationApi } from '@/components/ui/Notification';

import {
  type ApiErrorTipsRule,
  getApiErrorMessageVariables,
  getApiErrorTipsRule,
} from './error-rules';

type Translate = (key: string, values?: Record<string, unknown>) => string;
type HasTranslation = (key: string) => boolean;

interface ApiErrorPresenterContext {
  dialog: DialogContextValue;
  hasTranslation: HasTranslation;
  notificationApi: NotificationApi;
  t: Translate;
}

export default function ApiErrorReporter() {
  const [notificationApi] = notification.useNotification();
  const dialog = useDialog();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    // 把 React 层能力注入 API 错误处理器：API 模块保持纯净，展示逻辑留在组件树内。
    const translate = t as unknown as Translate;
    const hasTranslation: HasTranslation = (key) => i18n.exists(key);

    return setApiErrorHandler((error, context) => {
      presentApiError(error, context, {
        dialog,
        hasTranslation,
        notificationApi,
        t: translate,
      });
    });
  }, [dialog, i18n, notificationApi, t]);

  return null;
}

function presentApiError(
  error: ApiError,
  context: ApiErrorHandlerContext,
  presenterContext: ApiErrorPresenterContext,
) {
  const message = resolveApiErrorMessage(error, presenterContext);
  const content = formatApiErrorContent(error, message);
  const tipsRule = getApiErrorTipsRule(error);

  // 少数错误码需要承载后续动作时走 Tips；其他业务错误默认轻提示即可。
  if (tipsRule) {
    openTipsError(error, context, content, tipsRule, presenterContext);
    return;
  }

  presenterContext.notificationApi.error({
    description: content,
    key: `api_error_${getApiErrorDisplayCode(error)}`,
  });
}

function resolveApiErrorMessage(error: ApiError, { hasTranslation, t }: ApiErrorPresenterContext) {
  if (error.code !== undefined) {
    const messageKey = `message.error_${error.code}`;

    // 业务错误码优先使用 message.error_XXXX；变量值来自后端 data/details。
    if (hasTranslation(messageKey)) {
      return t(messageKey, getApiErrorMessageVariables(error));
    }
  }

  // 如果后端返回了未知错误码但带 message，保留后端消息；否则使用网络/超时等通用兜底文案。
  if (error.code !== undefined && error.message) return error.message;

  const fallbackKey = getFallbackMessageKey(error);
  if (hasTranslation(fallbackKey)) return t(fallbackKey);

  return error.message || 'Request failed. Please try again later.';
}

function getFallbackMessageKey(error: ApiError) {
  if (error.kind === 'network') return 'message.error_network';
  if (error.kind === 'timeout') return 'message.error_timeout';

  return 'message.error_unknown';
}

function getApiErrorDisplayCode(error: ApiError) {
  if (error.code !== undefined) return String(error.code);
  if (error.status !== undefined) return `HTTP ${error.status}`;

  return 'UNKNOWN';
}

function formatApiErrorContent(error: ApiError, message: string) {
  return `[${getApiErrorDisplayCode(error)}] - ${message}`;
}

function resolveRuleText(
  ruleText: string | null | undefined,
  ruleTextKey: string | undefined,
  fallback: string | null | undefined,
  error: ApiError,
  { hasTranslation, t }: ApiErrorPresenterContext,
) {
  if (ruleTextKey && hasTranslation(ruleTextKey)) {
    return t(ruleTextKey, getApiErrorMessageVariables(error));
  }

  if (ruleText !== undefined) return ruleText;

  return fallback;
}

function openTipsError(
  error: ApiError,
  context: ApiErrorHandlerContext,
  content: string,
  rule: ApiErrorTipsRule,
  presenterContext: ApiErrorPresenterContext,
) {
  const title = resolveRuleText(rule.title, rule.titleKey, content, error, presenterContext);
  const description = resolveRuleText(
    rule.description,
    rule.descriptionKey,
    null,
    error,
    presenterContext,
  );
  const confirmText = resolveRuleText(
    rule.confirmText,
    rule.confirmTextKey,
    undefined,
    error,
    presenterContext,
  );
  const cancelText = resolveRuleText(
    rule.cancelText,
    rule.cancelTextKey,
    undefined,
    error,
    presenterContext,
  );

  presenterContext.dialog.open('Tips', {
    maskClosable: rule.maskClosable ?? false,
    props: {
      cancelText,
      confirmText,
      description,
      onCancel: () => rule.onCancel?.(error, context),
      onConfirm: () => rule.onConfirm?.(error, context),
      title,
      type: rule.type ?? 'error',
    },
  });
}
