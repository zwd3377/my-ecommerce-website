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
      return redirect(`/product/${product.id}?message=Failed to add to cart. Please try again.`);
    }

    revalidatePath(`/product/${product.id}`);
    return redirect(`/product/${product.id}?message=Added to cart successfully!`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Image */}
            <div className="p-6">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-xl">
                <img
                  src={product.image_url ?? ''}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 flex flex-col justify-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4">
                <p className="text-4xl font-bold text-gray-900">${product.price}</p>
              </div>

              {/* Description */}
              <div className="mt-6">
                <div className="space-y-6">
                  <p className="text-base text-gray-600">{product.description}</p>
                </div>
              </div>

              {/* Add to Cart Form */}
              <form action={addToCart} className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                >
                  添加到购物车
                </button>
              </form>

              {/* Message Display */}
              {searchParams?.message && (
                <div className={`mt-6 p-4 rounded-md text-center ${searchParams.message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p className="font-medium">{searchParams.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
