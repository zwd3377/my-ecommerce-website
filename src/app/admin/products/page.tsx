import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import DeleteProductButton from '@/components/DeleteProductButton';

export const revalidate = 0;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { message?: string; q?: string };
}) {
  const admin = createAdminClient();
  let query = admin.from('products').select('*').order('id', { ascending: false });
  if (searchParams?.q) {
    query = query.ilike('name', `%${searchParams.q}%`);
  }
  const { data: products, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">商品管理</h1>
          <p className="mt-1 text-sm text-gray-500">在这里上架、编辑或下架商品。</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:shadow-md transition"
        >
          <span className="text-lg leading-none">+</span> 新增商品
        </Link>
      </div>

      {searchParams?.message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {searchParams.message}
        </div>
      )}

      {/* Search */}
      <form className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={searchParams?.q ?? ''}
          placeholder="搜索商品名称…"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-700 transition"
        >
          搜索
        </button>
      </form>

      {error ? (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-600">
          加载失败：{error.message}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl">📦</div>
          <p className="mt-4 text-gray-700 font-medium">暂无商品</p>
          <p className="mt-1 text-sm text-gray-500">点击右上角「新增商品」开始上架</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">商品</th>
                  <th className="px-4 py-3">价格</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image_url ?? ''}
                          alt={p.name}
                          className="h-12 w-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {p.description || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-indigo-600 whitespace-nowrap">
                      ¥{Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500">#{p.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/product/${p.id}`}
                          className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition"
                        >
                          查看
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="rounded-lg px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          编辑
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
