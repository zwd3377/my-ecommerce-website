import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from 'next/cache';

// This tells Next.js to re-fetch data on every request.
export const revalidate = 0;

interface ProductPageProps {
  params: {
    id: string;
  };
  searchParams: {
    message: string;
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: product, error } = await supabase
    .from("products")
    .select("*, description")
    .eq("id", params.id)
    .single();

  // If the product doesn't exist, show a 404 page.
  if (error || !product) {
    notFound();
  }

  const addToCart = async () => {
    'use server';

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return redirect('/login');
    }

    const { error } = await supabase.rpc('add_to_cart', {
      product_id_to_add: product.id,
    });

    if (error) {
      console.error('Error adding to cart:', error); // Log the error for debugging
      return redirect(`/product/${product.id}?message=无法添加到购物车，请稍后重试`);
    }

    revalidatePath(`/product/${product.id}`);
    return redirect(`/product/${product.id}?message=已成功添加到购物车！`);
  };

  return (
    <div className="bg-white">
      <div className="pt-6">
        <div className="mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pt-16 lg:pb-24">
          {/* Product Title */}
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {product.name}
            </h1>
          </div>

          {/* Product Image */}
          <div className="mt-6 aspect-h-5 aspect-w-4 sm:overflow-hidden sm:rounded-lg lg:aspect-h-4 lg:aspect-w-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url ?? ''}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>

          {/* Product Price and Add to Cart */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">${product.price}</p>

            {searchParams?.message && (
              <div className="mt-4 text-sm font-medium text-green-600">
                {searchParams.message}
              </div>
            )}

            <form action={addToCart} className="mt-10">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                添加到购物车
              </button>
            </form>
          </div>

          {/* Product Description */}
          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pt-6 lg:pb-16 lg:pr-8">
            <div>
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6">
                <p className="text-base text-gray-900">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
