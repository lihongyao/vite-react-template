import { useEffect, useRef, useState } from 'react';

import { generatePath } from 'react-router';

import { transactionApi } from '@/api';
import type { Transaction } from '@/api/modules/transaction';
import SecondaryHeader from '@/components/features/SecondaryHeader';
import Skeleton from '@/components/ui/Skeleton';
import Tabs from '@/components/ui/Tabs';
import { NavigateToLink } from '@/i18n/navigation';
import { cn } from '@/libs/class-helpers';
import { ROUTE_PATHS } from '@/routes/paths';

import {
  type StatusFilter,
  clearTransactionListCache,
  readActiveTransactionFilter,
  readTransactionListCache,
  writeActiveTransactionFilter,
  writeTransactionListCache,
} from './cache';
import { TRANSACTION_STATUS_META, formatTransactionAmount } from './status-meta';

const FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '待支付', value: 'pending' },
  { label: '退款中', value: 'refunding' },
  { label: '已取消', value: 'cancelled' },
];

export default function Page() {
  const initialFilter = readActiveTransactionFilter();
  const initialTab = Math.max(
    0,
    FILTERS.findIndex(({ value }) => value === initialFilter),
  );
  const initialCache = readTransactionListCache(initialFilter);
  const [activeTab, setActiveTab] = useState(initialTab);
  const activeFilter = FILTERS[activeTab]?.value ?? 'all';
  const [transactions, setTransactions] = useState<Transaction[]>(initialCache?.items ?? []);
  const [loadedFilter, setLoadedFilter] = useState<StatusFilter | null>(
    initialCache ? initialFilter : null,
  );
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const previousFilterRef = useRef(activeFilter);
  const previousRetryTokenRef = useRef(retryToken);

  useEffect(() => {
    const filterChanged = previousFilterRef.current !== activeFilter;
    const retryRequested = previousRetryTokenRef.current !== retryToken;
    previousFilterRef.current = activeFilter;
    previousRetryTokenRef.current = retryToken;

    // A cached scene can be mounted again when returning from a detail page.
    // Tab changes and retries intentionally continue to request fresh data.
    const cached = readTransactionListCache(activeFilter);
    if (!filterChanged && !retryRequested && cached) {
      setTransactions(cached.items);
      setLoadedFilter(activeFilter);
      setLoading(false);
      setError(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(false);
    setTransactions([]);

    const loadTransactions = async () => {
      try {
        const response = await transactionApi.list(
          activeFilter === 'all' ? {} : { status: activeFilter },
          controller.signal,
        );
        if (active) {
          setTransactions(response.items);
          setLoadedFilter(activeFilter);
          writeTransactionListCache(activeFilter, response.items);
        }
      } catch {
        if (active && !controller.signal.aborted) {
          setError(true);
          setLoadedFilter(activeFilter);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadTransactions();

    return () => {
      active = false;
      controller.abort();
    };
  }, [activeFilter, retryToken]);

  useEffect(() => {
    writeActiveTransactionFilter(activeFilter);
  }, [activeFilter]);

  const handleTabChange = (index: number) => {
    const nextFilter = FILTERS[index]?.value;
    if (!nextFilter || nextFilter === activeFilter) return;

    writeActiveTransactionFilter(nextFilter);
    setActiveTab(index);
  };

  const retry = () => {
    clearTransactionListCache(activeFilter);
    setRetryToken((current) => current + 1);
  };

  const isLoading = loading || loadedFilter !== activeFilter;

  return (
    <div className="min-h-svh bg-[#F4F5F7] text-[#202124]">
      <SecondaryHeader title="交易记录" />
      <Tabs
        ariaLabel="按订单状态筛选"
        menus={FILTERS.map(({ label }) => label)}
        current={activeTab}
        activeTabClassName="text-[#168653]"
        indicatorClassName="h-0.5 w-6 bg-[#168653]"
        tabClassName="mx-4 text-sm"
        tabListClassName="top-[calc(76px+env(safe-area-inset-top))]"
        sticky
        onChange={handleTabChange}
      >
        <main key={activeFilter} aria-busy={isLoading} className="px-3 pt-4 pb-8">
          <div className="flex items-end justify-between gap-4 px-1 pb-3">
            <div>
              <p className="text-xs leading-4 font-bold text-[#168653]">2026 年</p>
              <h1 className="mt-0.5 text-xl leading-7 font-black">我的订单</h1>
            </div>
            {!isLoading && !error ? (
              <span className="pb-0.5 text-xs text-[#9297A1]">共 {transactions.length} 笔</span>
            ) : null}
          </div>

          {isLoading ? <TransactionListSkeleton /> : null}

          {!isLoading && error ? (
            <section className="flex min-h-64 flex-col items-center justify-center bg-white px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#FFF1F0] text-xl text-[#C6534C]">
                !
              </div>
              <h2 className="mt-4 text-base font-bold">订单加载失败</h2>
              <p className="mt-1 text-sm text-[#9297A1]">请检查网络连接后重试。</p>
              <button
                type="button"
                className="mt-4 rounded-lg bg-[#168653] px-4 py-2 text-sm font-bold text-white active:opacity-80"
                onClick={retry}
              >
                重新加载
              </button>
            </section>
          ) : null}

          {!isLoading && !error && transactions.length > 0 ? (
            <section className="space-y-3" aria-label="订单列表">
              {transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </section>
          ) : null}

          {!isLoading && !error && transactions.length === 0 ? (
            <section className="flex min-h-64 flex-col items-center justify-center bg-white px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#F1F2F4] text-xl text-[#9297A1]">
                —
              </div>
              <h2 className="mt-4 text-base font-bold">暂无相关订单</h2>
              <p className="mt-1 text-sm text-[#9297A1]">该状态下还没有交易记录</p>
            </section>
          ) : null}
        </main>
      </Tabs>
    </div>
  );
}

function TransactionListSkeleton() {
  return (
    <section className="space-y-3" aria-label="订单列表加载中">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-[#E7E9EC] bg-white">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-6 w-14 rounded-md" />
          </div>
          <div className="mx-4 border-t border-[#ECEEF1]" />
          <div className="flex items-end justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-2.5 w-2/5" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </section>
  );
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  const status = TRANSACTION_STATUS_META[transaction.status];

  return (
    <NavigateToLink
      aria-label={`查看${transaction.merchant}的订单详情`}
      className="block overflow-hidden rounded-lg border border-[#E7E9EC] bg-white outline-none focus-visible:border-[#168653] focus-visible:ring-2 focus-visible:ring-[#168653]/20"
      to={generatePath(ROUTE_PATHS.TransactionDetail, { id: transaction.id })}
    >
      <article>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div
            aria-hidden
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg text-base font-black',
              getMerchantColor(transaction.category),
            )}
          >
            {transaction.merchant.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm leading-5 font-bold text-[#30343B]">
              {transaction.merchant}
            </h2>
            <p className="mt-0.5 truncate text-xs leading-4 text-[#9297A1]">
              {transaction.category} · {transaction.createdAt}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-md px-2 py-1 text-[11px] leading-4 font-bold',
              status.badgeClassName,
            )}
          >
            {status.label}
          </span>
        </div>

        <div className="mx-4 border-t border-[#ECEEF1]" />

        <div className="flex items-end justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-xs leading-4 text-[#9297A1]">{transaction.note}</p>
            <p className="mt-1 font-mono text-[10px] leading-4 text-[#B0B4BB]">{transaction.id}</p>
          </div>
          <strong className="shrink-0 text-lg leading-6 font-black text-[#202124]">
            {formatTransactionAmount(transaction.amount)}
          </strong>
        </div>
      </article>
    </NavigateToLink>
  );
}

function getMerchantColor(category: string) {
  if (category.includes('餐饮')) return 'bg-[#FFF1E8] text-[#B85E24]';
  if (category.includes('数字')) return 'bg-[#EEF3FF] text-[#3D63B8]';
  if (category.includes('生活')) return 'bg-[#EAF8F0] text-[#168653]';
  if (category.includes('交通')) return 'bg-[#E9F7F8] text-[#247D83]';
  if (category.includes('运动')) return 'bg-[#FFF7E8] text-[#A86A12]';
  if (category.includes('娱乐')) return 'bg-[#F3EEFF] text-[#7652A8]';
  return 'bg-[#FFF0F3] text-[#B34D68]';
}
