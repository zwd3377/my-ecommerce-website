import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

interface OrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/login?message=请登录以查看订单详情&next=/account/orders/${params.orderId}`);
  }

  // Fetch the specific order, including its items and the related product details
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      total_amount,
      status,
      shipping_address,
      order_items (
        id,
        quantity,
        price,
        products (
          id,
          name,
          image_url
        )
      )
    `)
    .eq('id', params.orderId)
    .eq('user_id', user.id) // Security check: Ensure the order belongs to the current user
    .single();

  if (error || !order) {
    console.error('Error fetching order details:', error);
    notFound(); // If order not found or doesn't belong to user, show 404
  }

  // Extract shipping address safely
  const address = order.shipping_address as { fullName?: string, address?: string, city?: string, postalCode?: string } | null;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">订单详情</h1>
          <p className="mt-2 text-sm text-gray-500">
            订单号 <span className="font-medium text-gray-900">{order.id}</span> - 状态: <span className="font-medium text-indigo-600 capitalize">{order.status}</span>
          </p>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-medium text-gray-900">商品列表</h2>
            <ul role="list" className="mt-6 divide-y divide-gray-200">
              {order.order_items.map((item) => {
                const product = Array.isArray(item.products) ? item.products[0] : item.products;
                if (!product) return null; // Should not happen if data is consistent
                return (
                  <li key={item.id} className="flex space-x-6 py-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image_url ?? ''}
                      alt={product.name}
                      className="h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center"
                    />
                    <div className="flex-auto">
                      <div className="space-y-1 sm:flex sm:items-start sm:justify-between sm:space-x-6">
                        <div className="flex-auto space-y-1 text-sm font-medium">
                          <h3 className="text-gray-900">{product.name}</h3>
                          <p className="text-gray-900">${item.price}</p>
                          <p className="text-gray-500">数量: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 sm:flex sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">收货地址</h2>
              <div className="mt-4 text-sm text-gray-500">
                <p>{address?.fullName}</p>
                <p>{address?.address}</p>
                <p>{address?.city}, {address?.postalCode}</p>
              </div>
            </div>
            <div className="mt-8 sm:mt-0">
              <h2 className="text-lg font-medium text-gray-900">订单总计</h2>
              <p className="mt-4 text-3xl font-bold text-gray-900">${order.total_amount}</p>
            </div>
          </div>

          <div className="mt-16">
            <Link href="/account/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              &larr; 返回所有订单
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
