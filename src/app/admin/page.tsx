import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const [{ count: productCount }, ordersRes] = await Promise.all([
    admin.from('products').select('*', { count: 'exact', head: true }),
    admin.from('orders').select('id, total_amount, status, created_at').order('created_at', { ascending: false }),
  ]);

  const orders = ordersRes.data ?? [];
  const orderCount = orders.length;
  const revenue = orders.reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);
  const pending = orders.filter((o: any) => o.status === 'pending').length;

  const stats = [
    { label: '商品总数', value: productCount ?? 0, icon: '📦', cls: 'from-indigo-500 to-purple-500' },
    { label: '订单总数', value: orderCount, icon: '📋', cls: 'from-pink-500 to-red-500' },
    { label: '总销售额', value: `¥${revenue.toFixed(2)}`, icon: '💰', cls: 'from-emerald-500 to-green-500' },
    { label: '待处理订单', value: pending, icon: '⏳', cls: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">概览</h1>
          <p className="mt-1 text-sm text-gray-500">查看整体经营数据。</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md transition"
        >
          <span>+</span> 新增商品
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.cls} text-white text-lg shadow`}>
              {s.icon}
            </div>
            <p className="mt-3 text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">最近订单</h2>
          <Link href="/admin/orders" className="text-sm text-indigo-600 hover:underline">查看全部 →</Link>
        </div>
        <div className="mt-4 divide-y divide-gray-100">
          {orders.slice(0, 5).map((o: any) => (
            <div key={o.id} className="py-3 flex items-center justify-between text-sm">
              <span className="font-mono text-gray-900">#{o.id}</span>
              <span className="text-gray-500">{new Date(o.created_at).toLocaleString('zh-CN')}</span>
              <span className="font-semibold text-indigo-600">¥{Number(o.total_amount).toFixed(2)}</span>
              <span className="text-gray-600">{o.status}</span>
            </div>
          ))}
          {orders.length === 0 && <p className="py-6 text-center text-gray-400 text-sm">暂无订单</p>}
        </div>
      </div>
    </div>
  );
}
