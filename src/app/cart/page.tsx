import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Define the structure of a cart item joined with product details
type CartItem = {
  cart_item_id: number;
  quantity: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string | null;
};

export default async function CartPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login?message=请先登录以查看您的购物车');
  }

  // This query joins the 'cart' table with the 'products' table
  // to get all the necessary details for displaying the cart.
  const { data: cartItems, error } = await supabase
    .from('cart')
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        price,
        image_url
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching cart:', error);
    // You might want to show a more user-friendly error page here
    return <div>加载购物车时出错。</div>;
  }

  const total = cartItems.reduce((acc, item) => {
    // The 'products' field can be an array or an object depending on the relationship.
    // For a to-one relationship, it's an object.
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    if (product) {
      return acc + product.price * item.quantity;
    }
    return acc;
  }, 0);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">购物车</h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>

            <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {cartItems.length === 0 ? (
                <li className="py-6">您的购物车是空的。</li>
              ) : (
                cartItems.map((item) => {
                  const product = Array.isArray(item.products) ? item.products[0] : item.products;
                  if (!product) return null;
                  return (
                    <li key={item.id} className="flex py-6 sm:py-10">
                      <div className="flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image_url ?? ''}
                          alt={product.name}
                          className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-sm">
                                <Link href={`/product/${product.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                  {product.name}
                                </Link>
                              </h3>
                            </div>
                            <p className="mt-1 text-sm font-medium text-gray-900">${product.price}</p>
                          </div>

                          <div className="mt-4 sm:mt-0 sm:pr-9">
                            <label htmlFor={`quantity-${item.id}`} className="sr-only">
                              Quantity, {product.name}
                            </label>
                            {/* In the future, we can make this an editable input */}
                            <p className="mt-1 text-sm text-gray-500">数量: {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          {/* Order summary */}
          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          >
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              订单总览
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">商品总价</dt>
                <dd className="text-sm font-medium text-gray-900">${total.toFixed(2)}</dd>
              </div>
              {/* We can add shipping and taxes here later */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">订单总计</dt>
                <dd className="text-base font-medium text-gray-900">${total.toFixed(2)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                去结算
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}