import { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import { transactionApi } from '@/api';
import type { Transaction } from '@/api/modules/transaction';
import SecondaryHeader from '@/components/features/SecondaryHeader';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/libs/class-helpers';
import { TRANSACTION_STATUS_META, formatTransactionAmount } from '@/pages/Transactions/status-meta';

export default function Page() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError(true);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(false);
    setTransaction(null);

    const loadTransaction = async () => {
      try {
        const data = await transactionApi.details(id, controller.signal);
        if (active) setTransaction(data ?? null);
      } catch {
        if (active && !controller.signal.aborted) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadTransaction();

    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  return (
    <div className="min-h-svh bg-[#F4F5F7] text-[#202124]">
      <SecondaryHeader title="订单详情" />
      {loading ? <TransactionDetailSkeleton /> : null}
      {!loading && !error && transaction ? <TransactionDetails transaction={transaction} /> : null}
      {!loading && (error || !transaction) ? <MissingTransaction /> : null}
    </div>
  );
}

function TransactionDetailSkeleton() {
  return (
    <main className="pb-8" aria-label="订单详情加载中">
      <section className="bg-white px-5 pt-7 pb-6 text-center">
        <Skeleton className="mx-auto size-14 rounded-full" />
        <Skeleton className="mx-auto mt-3 h-5 w-16" />
        <Skeleton className="mx-auto mt-2 h-10 w-36" />
        <Skeleton className="mx-auto mt-2 h-4 w-64 max-w-full" />
      </section>
      <section className="mt-3 space-y-3 bg-white px-4 py-5">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </section>
      <section className="mt-3 space-y-3 bg-white px-4 py-5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-3/4" />
      </section>
      <section className="mt-3 space-y-3 bg-white px-4 py-5">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </section>
    </main>
  );
}

function TransactionDetails({ transaction }: { transaction: Transaction }) {
  const status = TRANSACTION_STATUS_META[transaction.status];
  const details = [
    { label: '商户名称', value: transaction.merchant },
    { label: '交易类型', value: transaction.category },
    { label: '付款方式', value: transaction.paymentMethod },
    { label: '创建时间', value: transaction.createdAt },
    { label: '交易单号', value: transaction.id, mono: true },
    { label: '商户单号', value: transaction.reference, mono: true },
  ];

  return (
    <main className="pb-8">
      <section className="bg-white px-5 pt-7 pb-6 text-center" aria-labelledby="amount-title">
        <div
          aria-hidden
          className={cn(
            'mx-auto flex size-14 items-center justify-center rounded-full text-2xl font-bold',
            status.iconClassName,
          )}
        >
          {status.symbol}
        </div>
        <p className="mt-3 text-sm font-bold text-[#30343B]">{status.label}</p>
        <h1 id="amount-title" className="mt-1 text-3xl leading-10 font-black">
          {formatTransactionAmount(transaction.amount)}
        </h1>
        <p className="mt-2 text-xs leading-5 text-[#737780]">{status.summary}</p>
      </section>

      <section className="mt-3 bg-white px-4 py-2" aria-labelledby="transaction-info-title">
        <h2 id="transaction-info-title" className="sr-only">
          交易信息
        </h2>
        <dl>
          {details.map(({ label, mono, value }) => (
            <div
              key={label}
              className="flex min-h-13 items-center justify-between gap-5 border-b border-[#ECEEF1] py-3 last:border-b-0"
            >
              <dt className="shrink-0 text-sm text-[#737780]">{label}</dt>
              <dd
                className={cn(
                  'min-w-0 text-right text-sm font-medium break-all text-[#30343B]',
                  mono && 'font-mono text-xs',
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-3 bg-white px-4 py-5" aria-labelledby="order-content-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="order-content-title" className="text-base leading-6 font-bold">
              订单内容
            </h2>
            <p className="mt-1 text-sm leading-5 text-[#737780]">{transaction.note}</p>
          </div>
          <span className="shrink-0 text-sm font-bold">
            {formatTransactionAmount(transaction.amount)}
          </span>
        </div>
      </section>

      <section className="mt-3 bg-white px-4 py-5" aria-labelledby="progress-title">
        <h2 id="progress-title" className="text-base leading-6 font-bold">
          订单进度
        </h2>
        <ol className="mt-4">
          {transaction.timeline.map((item, index) => {
            const isCurrent = index === 0;
            const isLast = index === transaction.timeline.length - 1;

            return (
              <li key={`${item.title}-${item.time}`} className="relative flex gap-3 pb-5 last:pb-0">
                {!isLast ? (
                  <span
                    aria-hidden
                    className="absolute top-3 bottom-0 left-[5px] w-px bg-[#DDE1E6]"
                  />
                ) : null}
                <span
                  aria-hidden
                  className={cn(
                    'relative z-10 mt-1 size-[11px] shrink-0 rounded-full border-2 bg-white',
                    isCurrent ? 'border-[#168653]' : 'border-[#C6CAD0]',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3
                      className={cn(
                        'text-sm leading-5 font-semibold',
                        isCurrent ? 'text-[#202124]' : 'text-[#646A73]',
                      )}
                    >
                      {item.title}
                    </h3>
                    <time className="shrink-0 text-[11px] text-[#A0A4AB]">{item.time}</time>
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-[#9297A1]">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="px-4 pt-5 text-center text-xs leading-5 text-[#A0A4AB]">
        本页面为交易记录示例，展示数据仅供演示
      </p>
    </main>
  );
}

function MissingTransaction() {
  return (
    <main className="flex min-h-[calc(100svh-76px-env(safe-area-inset-top))] items-center justify-center px-6 text-center">
      <div>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#F1F2F4] text-xl text-[#9297A1]">
          ?
        </div>
        <h1 className="mt-4 text-lg font-bold">未找到该交易</h1>
        <p className="mt-1 text-sm leading-5 text-[#737780]">订单可能已失效或交易编号不正确。</p>
      </div>
    </main>
  );
}
