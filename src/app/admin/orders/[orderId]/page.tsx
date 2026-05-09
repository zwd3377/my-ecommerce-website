import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import OrderStatusSelector from '@/components/OrderStatusSelector';
import type { OrderDetails } from '@/lib/types';

interface AdminOrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

// These are the possible statuses from our enum type in the database
const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default async function AdminOrderDetailsPage({ params }: AdminOrderDetailsPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // Admin Check
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return notFound();
  }

  const adminSupabase = createAdminClient();

  // Fetch the specific order using admin client
  const { data, error } = await adminSupabase
    .from('orders')
    .select(`*, order_items(*, products(*)) `)
    .eq('id', params.orderId)
    .single();

  // Explicitly cast the fetched data to our detailed type
  const order: OrderDetails | null = data as OrderDetails | null;

  if (error || !order) {
    notFound();
  }

  

  const address = order.shipping_address as { fullName?: string, address?: string, city?: string, postalCode?: string } | null;

  return (
    <div className="p-8">
      <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-8 block">
        &larr; 返回所有订单
      </Link>
      
      <h1 className="text-3xl font-bold">订单详情 #{order.id}</h1>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-lg font-medium text-gray-900">商品列表</h2>
          <ul role="list" className="mt-4 divide-y divide-gray-200 border-t border-b">
            {order.order_items.map((item) => {
              const product = Array.isArray(item.products) ? item.products[0] : item.products;
              return (
                <li key={item.id} className="flex py-4">
                  <div className="flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product?.image_url ?? ''} alt={product?.name ?? ''} className="h-16 w-16 rounded-md object-cover" />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <h4 className="font-medium text-gray-900">{product?.name ?? '商品已删除'}</h4>
                    <p className="text-sm text-gray-500">单价: ${item.price}</p>
                    <p className="text-sm text-gray-500">数量: {item.quantity}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="text-lg font-medium text-gray-900">更新状态</h2>
            <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">收货地址</h2>
            <address className="mt-4 not-italic text-gray-500">
              <p>{address?.fullName}</p>
              <p>{address?.address}</p>
              <p>{address?.city}, {address?.postalCode}</p>
            </address>
          </div>

           <div className="mt-8 border-t pt-8">
              <h2 className="text-lg font-medium text-gray-900">订单总计</h2>
              <p className="mt-2 text-2xl font-bold text-gray-900">${order.total_amount}</p>
            </div>
        </div>
      </div>
    </div>
  );
}