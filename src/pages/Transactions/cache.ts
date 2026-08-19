import type { Transaction, TransactionStatus } from '@/api/modules/transaction';

export type StatusFilter = 'all' | TransactionStatus;

type TransactionListCacheEntry = {
  items: Transaction[];
};

let activeFilter: StatusFilter = 'all';
const entries = new Map<StatusFilter, TransactionListCacheEntry>();

export function readTransactionListCache(filter: StatusFilter) {
  return entries.get(filter);
}

export function writeTransactionListCache(filter: StatusFilter, items: Transaction[]) {
  entries.set(filter, { items });
}

export function clearTransactionListCache(filter: StatusFilter) {
  entries.delete(filter);
}

export function readActiveTransactionFilter() {
  return activeFilter;
}

export function writeActiveTransactionFilter(filter: StatusFilter) {
  activeFilter = filter;
}
