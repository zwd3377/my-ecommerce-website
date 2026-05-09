import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ProductCard from "@/app/product-card";
// This tells Next.js to re-fetch data on every request.
export const revalidate = 0;

export default async function Home() {
    const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: products, error } = await supabase.from("products").select("*").returns<Product[]>();

  if (error) {
    return (
      <div className="bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            加载商品时发生错误
          </h2>
          <p className="mt-4 text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            我们的商品
          </h2>
          <p className="mt-4 text-gray-500">目前没有商品可供展示。请稍后再来！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            我们的商品
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            探索我们精心挑选的最新系列商品。
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-10">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
