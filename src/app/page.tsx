import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ProductCard from "@/app/product-card";
import Link from "next/link";

export const revalidate = 0;

interface Props {
  searchParams: { q?: string };
}

export default async function Home({ searchParams }: Props) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const q = (searchParams?.q || '').trim();

  let query = supabase.from("products").select("*").order('id', { ascending: false });
  if (q) query = query.ilike('name', `%${q}%`);
  const { data: products, error } = await query.returns<Product[]>();

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.2),_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-medium text-white ring-1 ring-white/30">
              ✨ 全场新品上市 · 限时优惠
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              发现你的<br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                理想生活方式
              </span>
            </h1>
            <p className="mt-6 text-lg text-indigo-100 max-w-xl">
              精选全球好物，品质保证，闪电送达。让购物成为一种享受。
            </p>

            {/* Search */}
            <form action="/" className="mt-8 max-w-lg flex items-center gap-2 rounded-full bg-white/95 backdrop-blur p-1.5 shadow-xl">
              <span className="pl-4 text-gray-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
              </span>
              <input
                name="q"
                defaultValue={q}
                placeholder="搜索你想要的商品…"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none px-2"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-5 py-2 hover:shadow-md transition"
              >
                搜索
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "🚚", title: "全场免邮", desc: "满99包邮到家" },
            { icon: "🛡️", title: "正品保障", desc: "假一赔十承诺" },
            { icon: "↩️", title: "7天退换", desc: "无理由轻松退" },
            { icon: "💬", title: "贴心客服", desc: "7×24小时在线" },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {q ? `搜索结果：${q}` : '精选商品'}
            </h2>
            <p className="mt-2 text-gray-500">
              {q
                ? `共找到 ${products?.length ?? 0} 件相关商品`
                : '探索我们精心挑选的最新系列'}
            </p>
          </div>
          {q && (
            <Link
              href="/"
              className="text-sm text-indigo-600 hover:underline"
            >
              清除搜索 ✕
            </Link>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center">
            <p className="text-red-600 font-medium">加载商品时发生错误</p>
            <p className="mt-2 text-sm text-red-500">{error.message}</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center">
            <div className="text-5xl">{q ? '🔍' : '🛍️'}</div>
            <p className="mt-4 text-gray-700 font-medium">
              {q ? '没有找到相关商品' : '暂无商品'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {q ? '试试其他关键词' : '请稍后再来看看吧！'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} 我的商店. 保留所有权利.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">关于我们</a>
            <a href="#" className="hover:text-white transition-colors">联系客服</a>
            <a href="#" className="hover:text-white transition-colors">隐私政策</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
