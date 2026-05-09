import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

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

      const updateQuantity = async (formData: FormData) => {
    'use server';
    const cartItemId = Number(formData.get('cart_item_id'));
    const newQuantity = Number(formData.get('new_quantity'));

    if (isNaN(cartItemId) || isNaN(newQuantity)) {
      return;
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    await supabase.rpc('update_cart_item_quantity', {
      cart_item_id_to_update: cartItemId,
      new_quantity: newQuantity,
    });

    revalidatePath('/cart');
  };

  const removeItem = async (formData: FormData) => {
    'use server';
    const cartItemId = Number(formData.get('cart_item_id'));
    if (isNaN(cartItemId)) {
      return;
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    await supabase.rpc('remove_item_from_cart', {
      cart_item_id_to_remove: cartItemId
    });

    revalidatePath('/cart');
  };

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
                            <div className="flex items-center">
                              <form action={updateQuantity}>
                                <input type="hidden" name="cart_item_id" value={item.id} />
                                <input type="hidden" name="new_quantity" value={item.quantity - 1} />
                                <button type="submit" className="h-7 w-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50" disabled={item.quantity <= 1}>-</button>
                              </form>
                              <p className="mx-4 text-sm font-medium text-gray-900">{item.quantity}</p>
                              <form action={updateQuantity}>
                                <input type="hidden" name="cart_item_id" value={item.id} />
                                <input type="hidden" name="new_quantity" value={item.quantity + 1} />
                                <button type="submit" className="h-7 w-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50">+</button>
                              </form>
                            </div>

                            <div className="absolute top-0 right-0">
                              <form action={removeItem}>
                                <input type="hidden" name="cart_item_id" value={item.id} />
                                <button type="submit" className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                                  <span className="sr-only">Remove</span>
                                  {/* Heroicon name: solid/x */}
                                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </form>
                            </div>
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
              <Link
                href="/checkout"
                className="w-full block text-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                去结算
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}