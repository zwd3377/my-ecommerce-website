import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/login?message=请先登录');
  if (user.email !== process.env.ADMIN_EMAIL) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-7xl">🔒</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">访问被拒绝</h1>
          <p className="mt-2 text-gray-500">您没有权限访问后台管理。</p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: '概览', icon: '📊' },
    { href: '/admin/products', label: '商品管理', icon: '📦' },
    { href: '/admin/orders', label: '订单管理', icon: '📋' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* Sidebar */}
        <aside className="lg:w-60 flex-shrink-0">
          <div className="lg:sticky lg:top-20 rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 px-2 mb-2">管理后台</p>
            <nav className="space-y-1">
              {navItems.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                >
                  <span>{it.icon}</span>
                  <span className="font-medium">{it.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="px-3 text-xs text-gray-400">登录身份</p>
              <p className="px-3 text-sm text-gray-700 truncate">{user.email}</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
