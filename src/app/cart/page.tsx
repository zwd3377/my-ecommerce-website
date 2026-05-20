import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CartList, { CartLineItem } from '@/components/CartList';

export const revalidate = 0;

export default async function CartPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?message=请先登录以查看您的购物车');
  }

  const { data: cartItems, error } = await supabase
    .from('cart')
    .select(`
      id,
      quantity,
      products ( id, name, price, image_url )
    `)
    .eq('user_id', user.id)
    .order('id', { ascending: true });

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-600">
          加载购物车失败：{error.message}
        </div>
      </div>
    );
  }

  const items: CartLineItem[] = (cartItems ?? [])
    .map((row: any) => {
      const p = Array.isArray(row.products) ? row.products[0] : row.products;
      if (!p) return null;
      return {
        id: row.id,
        quantity: row.quantity,
        product: {
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image_url: p.image_url,
        },
      } as CartLineItem;
    })
    .filter(Boolean) as CartLineItem[];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          购物车
        </h1>
        <p className="mt-2 text-gray-500">检查并管理你的商品，随时去结算。</p>

        <div className="mt-8">
          <CartList initialItems={items} />
        </div>
      </div>
    </div>
  );
}
