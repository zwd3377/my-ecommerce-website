import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/app/product-card";
import type { Product } from "@/lib/types";

export const revalidate = 0;

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: product, error } = await supabase
    .from("products")
    .select("*, description")
    .eq("id", params.id)
    .single();

  if (error || !product) notFound();

  // Admin check (for inline edit shortcut)
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  // Related products (other products, randomly limited)
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .neq("id", product.id)
    .limit(4)
    .returns<Product[]>();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-indigo-600 transition-colors">首页</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[60vw]">{product.name}</span>
          {isAdmin && (
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-medium hover:bg-amber-200 transition"
            >
              ✏️ 编辑此商品
            </Link>
          )}
        </nav>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden ring-1 ring-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-4 sm:p-6">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url ?? ""}
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-medium text-gray-800 shadow">
                  ✨ 优选
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-10 flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm text-amber-500">
                <span>★★★★★</span>
                <span className="text-gray-500">(128 条评价)</span>
              </div>

              <div className="mt-5 flex items-baseline gap-3 flex-wrap">
                <p className="text-4xl font-extrabold text-gray-900">
                  <span className="text-xl text-gray-500 mr-0.5">¥</span>
                  {product.price}
                </p>
                <span className="text-sm text-gray-400 line-through">
                  ¥{(Number(product.price) * 1.2).toFixed(2)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                  限时 8 折
                </span>
              </div>

              <p className="mt-6 text-base text-gray-600 leading-relaxed">
                {product.description || "高品质精选商品，设计简约，做工细腻，带给你舒适的使用体验。"}
              </p>

              <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">🚚 全场免邮</li>
                <li className="flex items-center gap-2">🛡️ 正品保障</li>
                <li className="flex items-center gap-2">↩️ 7天退换</li>
                <li className="flex items-center gap-2">⚡ 闪电发货</li>
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <AddToCartButton productId={product.id} />
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 px-6 text-base font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  去购物车
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related && related.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">你可能还喜欢</h2>
              <Link href="/" className="text-sm text-indigo-600 hover:underline">查看全部 →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
