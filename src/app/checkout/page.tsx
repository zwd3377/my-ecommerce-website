import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// This is a simplified checkout page. In a real-world scenario, 
// you'd have a much more robust address form and validation.

export default async function CheckoutPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login?message=请先登录以进行结算');
  }

  // Fetch cart items to display a summary
  const { data: cartItems, error: cartError } = await supabase
    .from('cart')
    .select(`*, products(*)`)
    .eq('user_id', user.id);

  if (cartError || !cartItems || cartItems.length === 0) {
    // If cart is empty, redirect back to cart page with a message
    return redirect('/cart?message=您的购物车是空的，无法结算');
  }

  const total = cartItems.reduce((acc, item) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    return product ? acc + product.price * item.quantity : acc;
  }, 0);

  // The Server Action that will process the order
  const processOrder = async (formData: FormData) => {
    'use server';

    const shippingAddress = {
      fullName: formData.get('full-name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      postalCode: formData.get('postal-code') as string,
    };

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Call the RPC function to create the order and get the new order ID
    const { data: newOrderId, error } = await supabase
      .rpc('create_order_from_cart', {
        shipping_address_data: shippingAddress,
      })
      .single(); // .single() is used because the function returns a single value

    if (error) {
      console.error('Error creating order:', error);
      return redirect('/checkout?message=Order creation failed. Please try again.');
    }

    // On success, revalidate the cart path to reflect that it's empty
    revalidatePath('/cart');
    
    // Redirect to a dynamic success page with the new order ID
    return redirect(`/order/success/${newOrderId}`);
  };

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">结算</h2>

        <form action={processOrder} className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16 mt-12">
          {/* Shipping Information Form */}
          <div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">收货信息</h2>

              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div className="sm:col-span-2">
                  <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                    姓名
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="full-name"
                      name="full-name"
                      autoComplete="name"
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    详细地址
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      autoComplete="street-address"
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    城市
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="city"
                      id="city"
                      autoComplete="address-level2"
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
                    邮政编码
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="postal-code"
                      id="postal-code"
                      autoComplete="postal-code"
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900">订单总览</h2>

            <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
              <ul role="list" className="divide-y divide-gray-200">
                {cartItems.map((item) => {
                   const product = Array.isArray(item.products) ? item.products[0] : item.products;
                   if (!product) return null;
                   return (
                    <li key={item.id} className="flex py-6 px-4 sm:px-6">
                      <div className="flex-shrink-0">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image_url ?? ''} alt={product.name} className="w-20 rounded-md" />
                      </div>
                      <div className="ml-6 flex flex-1 flex-col">
                        <div className="flex">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-700 hover:text-gray-800">{product.name}</h4>
                            <p className="mt-1 text-sm text-gray-500">数量: {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                   );
                })}
              </ul>
              <dl className="space-y-6 border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-base font-medium">总计</dt>
                  <dd className="text-base font-medium text-gray-900">${total.toFixed(2)}</dd>
                </div>
              </dl>

              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <button
                  type="submit"
                  className="w-full rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  确认下单
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}