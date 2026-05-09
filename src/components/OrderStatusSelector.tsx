'use client';

import { updateOrderStatus } from '@/app/admin/orders/actions';

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

interface OrderStatusSelectorProps {
  orderId: number;
  currentStatus: string;
}

export default function OrderStatusSelector({ orderId, currentStatus }: OrderStatusSelectorProps) {
  return (
    <form action={updateOrderStatus} className="mt-4">
      <input type="hidden" name="orderId" value={orderId} />
      <label htmlFor="status" className="sr-only">订单状态</label>
      <select
        id="status"
        name="status"
        defaultValue={currentStatus}
        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      >
        {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button
        type="submit"
        className="mt-4 w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        更新状态
      </button>
    </form>
  );
}