import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import OrderStatusSelector from '@/components/OrderStatusSelector';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import type { OrderDetails } from '@/lib/types';

export const revalidate = 0;

interface Props {
  params: { orderId: string };
}

export default async function AdminOrderDetailsPage({ params }: Props) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) notFound();

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('orders')
    .select(`*, order_items(*, products(*))`)
    .eq('id', params.orderId)
    .single();

  const order: OrderDetails | null = data as OrderDetails | null;
  if (error || !order) notFound();

  const address = order.shipping_address as
    | { fullName?: string; address?: string; city?: string; postalCode?: string }
    | null;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500 flex items-center gap-2">
        <Link href="/admin/orders" className="hover:text-indigo-600">订单管理</Link>
        <span>/</span>
        <span className="text-gray-700">#{order.id}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">订单 #{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
            <h2 className="px-6 pt-6 text-lg font-semibold text-gray-900">商品列表</h2>
            <ul className="mt-4 divide-y divide-gray-100">
              {order.order_items.map((item: any) => {
                const p = Array.isArray(item.products) ? item.products[0] : item.products;
                return (
                  <li key={item.id} className="flex p-4 sm:p-5 gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p?.image_url ?? ''}
                      alt={p?.name ?? ''}
                      className="h-16 w-16 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {p?.name ?? '商品已删除'}
                      </p>
                      <p className="text-xs text-gray-500">单价 ¥{Number(item.price).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">数量 × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 self-center whitespace-nowrap">
                      ¥{(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">收货地址</h2>
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <p className="font-medium">{address?.fullName ?? '—'}</p>
              <p>{address?.address ?? '—'}</p>
              <p>{address?.city ?? '—'} {address?.postalCode ?? ''}</p>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">更新状态</h2>
            <div className="mt-3">
              <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
            </div>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">订单总计</h2>
            <p className="mt-3 text-3xl font-extrabold text-indigo-600">
              ¥{Number(order.total_amount).toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              下单时间 {new Date(order.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
