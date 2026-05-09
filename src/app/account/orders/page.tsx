import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function OrdersPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login?message=请先登录以查看您的订单');
  }

  // Fetch all orders for the current user
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, created_at, total_amount, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }); // Show newest orders first

  if (error) {
    console.error('Error fetching orders:', error);
    return <div className="p-8">加载订单时出错，请稍后重试。</div>;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">我的订单</h1>
          <p className="mt-2 text-sm text-gray-500">
            在这里查看您的订单历史和状态。
          </p>
        </div>

        <div className="mt-12 space-y-16 sm:mt-16">
          {orders.length === 0 ? (
            <p>您还没有任何订单。</p>
          ) : (
            orders.map((order) => (
              <section key={order.id} aria-labelledby={`${order.id}-heading`}>
                <div className="space-y-8 md:flex md:items-end md:justify-between md:space-y-0">
                  <div className="space-y-4 md:flex md:items-center md:space-y-0 md:space-x-4">
                    <dl className="flex space-x-8 sm:space-x-16">
                      <div>
                        <dt className="font-medium text-gray-900">订单号</dt>
                        <dd className="mt-1 text-gray-500">{order.id}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-900">下单日期</dt>
                        <dd className="mt-1 text-gray-500">
                          <time dateTime={order.created_at}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </time>
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-900">总金额</dt>
                        <dd className="mt-1 font-medium text-gray-900">${order.total_amount}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex items-end space-x-4">
                    <div className="ml-4">
                      <h4 className="sr-only">Status</h4>
                      <p className="text-sm font-medium text-gray-900 capitalize">{order.status}</p>
                    </div>
                    {/* <Link
                      href={`/account/orders/${order.id}`}
                      className="flex items-center justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span>查看详情</span>
                    </Link> */}
                  </div>
                </div>
                {/* In the future, we can add product images here */}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}