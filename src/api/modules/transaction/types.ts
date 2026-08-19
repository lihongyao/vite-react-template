export type TransactionStatus = 'cancelled' | 'completed' | 'pending' | 'refunding';

export type TransactionTimelineItem = {
  description: string;
  time: string;
  title: string;
};

export type Transaction = {
  amount: number;
  category: string;
  createdAt: string;
  id: string;
  merchant: string;
  note: string;
  paymentMethod: string;
  reference: string;
  status: TransactionStatus;
  timeline: TransactionTimelineItem[];
};

export type TransactionListReq = {
  status?: TransactionStatus;
};

export type TransactionListRes = {
  items: Transaction[];
  total: number;
};

export type TransactionDetailReq = {
  id: Transaction['id'];
};

export type TransactionDetailRes = Transaction;
