import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import type { OrderSummary } from '@/lib/types';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import OrderStatusUpdater from '@/components/OrderStatusUpdater';

export const revalidate = 0;

async function updateOrderStatus(formData: FormData) {
  'use server';
  const orderId = Number(formData.get('order_id'));
  const newStatus = formData.get('new_status') as OrderSummary['status'];
  const ALL = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!orderId || !newStatus || !ALL.includes(newStatus)) return;
  const admin = createAdminClient();
  await admin.from('orders').update({ status: newStatus }).eq('id', orderId);
  revalidatePath('/admin/orders');
}

export default async function AdminOrdersPage() {
  const admin = createAdminClient();
  const { data: orders, error } = await admin
    .from('orders')
    .select('id, created_at, total_amount, status, shipping_address')
    .order('created_at', { ascending: false });

  const list: OrderSummary[] = (orders as any) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">订单管理</h1>
        <p className="mt-1 text-sm text-gray-500">查看并更新所有订单的状态。</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-600">
          加载失败：{error.message}
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl">📋</div>
          <p className="mt-4 text-gray-700 font-medium">暂无订单</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">订单号</th>
                  <th className="px-4 py-3">日期</th>
                  <th className="px-4 py-3">收件人</th>
                  <th className="px-4 py-3">总金额</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((order) => {
                  const addr = order.shipping_address as { fullName?: string } | null;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{addr?.fullName || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-indigo-600 whitespace-nowrap">
                        ¥{Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={order.status} />
                          <OrderStatusUpdater
                            orderId={order.id}
                            currentStatus={order.status}
                            updateOrderStatusAction={updateOrderStatus}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded-lg px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          详情
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
