import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import SubmitButton from '@/components/SubmitButton';

export const revalidate = 0;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?message=请先登录以进行结算');

  const { data: cartItems, error: cartError } = await supabase
    .from('cart')
    .select(`*, products(*)`)
    .eq('user_id', user.id);

  if (cartError || !cartItems || cartItems.length === 0) {
    return redirect('/cart?message=您的购物车是空的，无法结算');
  }

  const total = cartItems.reduce((acc, item) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    return product ? acc + product.price * item.quantity : acc;
  }, 0);
  const totalQty = cartItems.reduce((acc, it: any) => acc + (it.quantity ?? 0), 0);

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
    const { data: newOrderId, error } = await supabase
      .rpc('create_order_from_cart', { shipping_address_data: shippingAddress })
      .single();
    if (error) {
      return redirect('/checkout?message=下单失败，请稍后重试');
    }
    revalidatePath('/cart');
    return redirect(`/order/success/${newOrderId}`);
  };

  const inputCls =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition';

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <nav className="mb-4 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/cart" className="hover:text-indigo-600">购物车</Link>
          <span>/</span>
          <span className="text-gray-700">结算</span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">结算</h1>

        <form action={processOrder} className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Shipping */}
          <div className="lg:col-span-7 space-y-6">
            <section className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">收货信息</h2>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1.5">姓名</label>
                  <input id="full-name" name="full-name" autoComplete="name" required className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">手机号</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="可选" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">详细地址</label>
                  <input id="address" name="address" autoComplete="street-address" required className={inputCls} />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">城市</label>
                  <input id="city" name="city" autoComplete="address-level2" required className={inputCls} />
                </div>
                <div>
                  <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700 mb-1.5">邮政编码</label>
                  <input id="postal-code" name="postal-code" autoComplete="postal-code" required className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1.5">订单备注</label>
                  <textarea id="note" name="note" rows={3} placeholder="选填，例如送货时间偏好" className={inputCls} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">支付方式</h2>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'cod', label: '货到付款', icon: '💵', desc: '签收时支付' },
                  { id: 'wechat', label: '微信支付', icon: '💬', desc: '便捷扫码' },
                  { id: 'alipay', label: '支付宝', icon: '🅰️', desc: '安全可靠' },
                ].map((m, i) => (
                  <label key={m.id} className="cursor-pointer">
                    <input type="radio" name="pay-method" value={m.id} defaultChecked={i === 0} className="peer sr-only" />
                    <div className="rounded-xl border border-gray-200 p-3 text-center peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:ring-2 peer-checked:ring-indigo-200 transition">
                      <div className="text-2xl">{m.icon}</div>
                      <p className="mt-1 text-sm font-medium text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {searchParams?.message && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {searchParams.message}
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="mt-8 lg:mt-0 lg:col-span-5">
            <div className="sticky top-24 rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">订单总览</h2>
              </div>
              <ul className="divide-y divide-gray-100 max-h-80 overflow-auto">
                {cartItems.map((item: any) => {
                  const product = Array.isArray(item.products) ? item.products[0] : item.products;
                  if (!product) return null;
                  return (
                    <li key={item.id} className="flex p-4 sm:p-5 gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.image_url ?? ''} alt={product.name} className="h-16 w-16 rounded-lg object-cover bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">数量 × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">¥{(product.price * item.quantity).toFixed(2)}</p>
                    </li>
                  );
                })}
              </ul>
              <dl className="border-t border-gray-100 p-6 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <dt>商品 ({totalQty} 件)</dt>
                  <dd className="text-gray-900 font-medium">¥{total.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-gray-600">
                  <dt>运费</dt>
                  <dd className="text-green-600 font-medium">免运费</dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                  <dt className="font-semibold text-gray-900">应付总计</dt>
                  <dd className="font-extrabold text-indigo-600">¥{total.toFixed(2)}</dd>
                </div>
              </dl>
              <div className="px-6 pb-6">
                <SubmitButton pendingText="正在提交订单…">确认下单 →</SubmitButton>
                <p className="mt-3 text-center text-xs text-gray-500">
                  点击「确认下单」即表示您同意我们的<a className="text-indigo-600 hover:underline" href="#">服务条款</a>
                </p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
