import { MOCK_TRANSACTIONS, MOCK_TRANSACTIONS_BY_STATUS } from './mock-data';
import type {
  TransactionDetailReq,
  TransactionDetailRes,
  TransactionListReq,
  TransactionListRes,
} from './types';

export type * from './types';

const MOCK_REQUEST_DELAY_MS = 650;

/**
 * Mock implementation of the transaction endpoint. The status is deliberately
 * a request parameter so replacing this with a real HTTP call keeps the same
 * component contract.
 */
export function list(
  params: TransactionListReq = {},
  signal?: AbortSignal,
): Promise<TransactionListRes> {
  const items = params.status ? MOCK_TRANSACTIONS_BY_STATUS[params.status] : MOCK_TRANSACTIONS;

  return mockRequest({ items, total: items.length }, signal);
}

export function details(
  id: TransactionDetailReq['id'],
  signal?: AbortSignal,
): Promise<TransactionDetailRes | undefined> {
  const transaction = MOCK_TRANSACTIONS.find((item) => item.id === id);
  return mockRequest(transaction, signal);
}

function mockRequest<T>(value: T, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const timer = window.setTimeout(() => resolve(value), MOCK_REQUEST_DELAY_MS);
    const abort = () => {
      window.clearTimeout(timer);
      reject(createAbortError());
    };

    signal?.addEventListener('abort', abort, { once: true });
  });
}

function createAbortError() {
  return new DOMException('The request was aborted.', 'AbortError');
}
