'use client';

import type { OrderSummary } from '@/lib/types';

// 定义组件的 props 类型
interface OrderStatusUpdaterProps {
  orderId: number;
  currentStatus: OrderSummary['status'];
  updateOrderStatusAction: (formData: FormData) => Promise<void>;
}

// 订单状态常量
const ALL_STATUSES: Array<OrderSummary['status']> = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  updateOrderStatusAction,
}: OrderStatusUpdaterProps) {
  return (
    <form action={updateOrderStatusAction}>
      <input type="hidden" name="order_id" value={orderId} />
      <select
        name="new_status"
        defaultValue={currentStatus}
        className="block w-full rounded-md border-gray-300 py-1 pl-3 pr-8 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm capitalize"
        // 当选择新状态时，自动提交表单
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {ALL_STATUSES.map((status) => (
          <option key={status} value={status} className="capitalize">
            {status}
          </option>
        ))}
      </select>
    </form>
  );
}