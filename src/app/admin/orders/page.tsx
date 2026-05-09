import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import type { OrderSummary } from '@/lib/types';
import OrderStatusUpdater from '@/components/OrderStatusUpdater'; // 假设你在 types.ts 中定义了这个类型

// --- 修正点 1: 将 Server Action 移到组件外部 ---
// 这个函数现在是顶层函数，符合 Server Action 的要求。
async function updateOrderStatus(formData: FormData) {
  'use server'; // 'use server' 指令放在函数体的最开始

  const orderId = Number(formData.get('order_id'));
  const newStatus = formData.get('new_status') as OrderSummary['status'];

  // 简单的服务器端验证
  const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!orderId || !newStatus || !ALL_STATUSES.includes(newStatus)) {
    console.error('Invalid data for order status update.');
    return; // 在实际应用中可以返回一个错误对象
  }
  
  // 使用 Admin Client 更新数据，因为它需要绕过 RLS
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    console.error('Failed to update order status:', error);
    // 在真实应用中，你可能想通过返回一个对象来将错误信息传递给UI
    return;
  }

  // --- 修正点 2: 使用 revalidatePath 按需重新验证 ---
  // 这会使 Next.js 重新获取当前页面的数据，从而显示最新的订单状态。
  revalidatePath('/admin/orders');
}

// 建议定义订单状态的常量，以便复用
const ALL_STATUSES: Array<OrderSummary['status']> = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default async function AdminOrdersPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 验证用户是否为管理员
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">访问被拒绝</h1>
        <p className="mt-2">您没有权限访问此页面。</p>
        <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  // 2. 如果是管理员，使用 Admin Client 获取所有订单
  const adminSupabase = createAdminClient();
  const { data: orders, error } = await adminSupabase
    .from('orders')
    .select('id, created_at, total_amount, status, shipping_address')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching all orders for admin:', error);
    return <div className="p-8">加载所有订单时出错。</div>;
  }
  
  // 类型断言，确保数据类型正确
  const typedOrders: OrderSummary[] = orders || [];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">后台 - 所有订单</h1>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">订单号</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">日期</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">收件人</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">总金额</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">状态</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {typedOrders.map((order) => {
                  // 从 JSONB 字段中安全地获取收件人姓名
                  const address = order.shipping_address as { fullName?: string };
                  return (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{order.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{address?.fullName || 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${order.total_amount.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {/* --- 修正点 3: 将表单的 action 指向顶层函数 --- */}
                        <OrderStatusUpdater
                          orderId={order.id}
                          currentStatus={order.status}
                          updateOrderStatusAction={updateOrderStatus}
                        />
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        {/* --- 结合点: 保留了 Edit 链接 --- */}
                        <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
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
      </div>
    </div>
  );
}