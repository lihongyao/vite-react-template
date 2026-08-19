import type { TransactionStatus } from '@/api/modules/transaction';

export const TRANSACTION_STATUS_META = {
  cancelled: {
    label: '已取消',
    badgeClassName: 'bg-[#F1F2F4] text-[#737780]',
    iconClassName: 'bg-[#F1F2F4] text-[#737780]',
    symbol: '×',
    summary: '订单已取消，本次交易未产生扣款',
  },
  completed: {
    label: '已完成',
    badgeClassName: 'bg-[#EAF8F0] text-[#168653]',
    iconClassName: 'bg-[#EAF8F0] text-[#168653]',
    symbol: '✓',
    summary: '交易已完成，感谢你的购买',
  },
  pending: {
    label: '待支付',
    badgeClassName: 'bg-[#FFF7E8] text-[#A86A12]',
    iconClassName: 'bg-[#FFF7E8] text-[#A86A12]',
    symbol: '…',
    summary: '订单等待付款，请留意支付时限',
  },
  refunding: {
    label: '退款中',
    badgeClassName: 'bg-[#EEF3FF] text-[#3D63B8]',
    iconClassName: 'bg-[#EEF3FF] text-[#3D63B8]',
    symbol: '↻',
    summary: '退款申请处理中，预计 1-3 个工作日到账',
  },
} as const satisfies Record<
  TransactionStatus,
  {
    badgeClassName: string;
    iconClassName: string;
    label: string;
    summary: string;
    symbol: string;
  }
>;

export function formatTransactionAmount(amount: number) {
  return `¥${amount.toFixed(2)}`;
}
