import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { OrderSummary } from '@/lib/types';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export const revalidate = 0;

export default async function OrdersPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?message=请先登录以查看您的订单');

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, created_at, total_amount, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const typedOrders: OrderSummary[] = orders || [];

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-16 px-4">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-600">
          加载订单出错：{error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          我的订单
        </h1>
        <p className="mt-2 text-gray-500">查看订单历史和最新状态。</p>

        <div className="mt-8 space-y-4">
          {typedOrders.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center">
              <div className="text-5xl">📦</div>
              <p className="mt-4 text-gray-700 font-medium">暂无订单</p>
              <p className="mt-1 text-sm text-gray-500">快去挑选你喜欢的商品吧～</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 text-sm font-semibold shadow hover:shadow-lg transition-shadow"
              >
                去逛逛
              </Link>
            </div>
          ) : (
            typedOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block rounded-2xl bg-white p-5 sm:p-6 ring-1 ring-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">订单号</dt>
                      <dd className="mt-0.5 font-mono font-semibold text-gray-900">#{order.id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">下单日期</dt>
                      <dd className="mt-0.5 text-gray-700">
                        <time dateTime={order.created_at}>
                          {new Date(order.created_at).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">总金额</dt>
                      <dd className="mt-0.5 font-bold text-indigo-600">
                        ¥{Number(order.total_amount).toFixed(2)}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-gray-400">›</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
