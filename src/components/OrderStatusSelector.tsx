'use client';

import { updateOrderStatus } from '@/app/admin/orders/actions';
import SubmitButton from './SubmitButton';

const STATUSES: Array<{ value: string; label: string; icon: string }> = [
  { value: 'pending', label: '待处理', icon: '⏳' },
  { value: 'processing', label: '处理中', icon: '🔧' },
  { value: 'shipped', label: '已发货', icon: '🚚' },
  { value: 'delivered', label: '已送达', icon: '✅' },
  { value: 'cancelled', label: '已取消', icon: '✕' },
];

interface Props {
  orderId: number;
  currentStatus: string;
}

export default function OrderStatusSelector({ orderId, currentStatus }: Props) {
  return (
    <form action={updateOrderStatus} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label htmlFor="status" className="sr-only">订单状态</label>
      <select
        id="status"
        name="status"
        defaultValue={currentStatus}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.icon} {s.label}
          </option>
        ))}
      </select>
      <SubmitButton pendingText="更新中…">更新状态</SubmitButton>
    </form>
  );
}
