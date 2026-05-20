import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export const revalidate = 0;

interface Props {
  params: { orderId: string };
}

export default async function OrderDetailsPage({ params }: Props) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/login?message=请登录以查看订单详情`);
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, total_amount, status, shipping_address,
      order_items ( id, quantity, price, products ( id, name, image_url ) )
    `)
    .eq('id', params.orderId)
    .eq('user_id', user.id)
    .single();

  if (error || !order) notFound();

  const address = order.shipping_address as
    | { fullName?: string; address?: string; city?: string; postalCode?: string }
    | null;

  const itemsTotal = (order.order_items ?? []).reduce(
    (s: number, it: any) => s + Number(it.price) * it.quantity,
    0
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-5xl py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 flex items-center gap-2 mb-4">
          <Link href="/account/orders" className="hover:text-indigo-600">我的订单</Link>
          <span>/</span>
          <span className="text-gray-700">#{order.id}</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">订单 #{order.id}</h1>
            <p className="mt-1 text-sm text-gray-500">
              下单时间 {new Date(order.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
              <h2 className="px-6 pt-6 text-lg font-semibold text-gray-900">商品列表</h2>
              <ul className="mt-4 divide-y divide-gray-100">
                {(order.order_items ?? []).map((item: any) => {
                  const p = Array.isArray(item.products) ? item.products[0] : item.products;
                  return (
                    <li key={item.id} className="flex p-4 sm:p-5 gap-4">
                      {p && (
                        <Link href={`/product/${p.id}`} className="flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image_url ?? ''}
                            alt={p.name}
                            className="h-20 w-20 rounded-xl object-cover bg-gray-100"
                          />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={p ? `/product/${p.id}` : '#'}
                          className="text-sm sm:text-base font-medium text-gray-900 hover:text-indigo-600 line-clamp-2"
                        >
                          {p?.name ?? '商品已删除'}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500">单价 ¥{Number(item.price).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">数量 × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 self-center">
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
                <p>
                  {address?.city ?? '—'} {address?.postalCode ?? ''}
                </p>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">金额明细</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <dt>商品总额</dt>
                  <dd className="text-gray-900 font-medium">¥{itemsTotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-gray-600">
                  <dt>运费</dt>
                  <dd className="text-green-600 font-medium">免运费</dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                  <dt className="font-semibold text-gray-900">订单总计</dt>
                  <dd className="font-extrabold text-indigo-600">
                    ¥{Number(order.total_amount).toFixed(2)}
                  </dd>
                </div>
              </dl>
              <Link
                href="/"
                className="mt-2 w-full inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
              >
                继续购物
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
