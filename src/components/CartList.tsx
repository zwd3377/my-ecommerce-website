'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './Toast';

export type CartLineItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
  };
};

export default function CartList({ initialItems }: { initialItems: CartLineItem[] }) {
  const [items, setItems] = useState<CartLineItem[]>(initialItems);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { show } = useToast();

  const setPending = (id: number, on: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  };

  const updateQty = (id: number, newQty: number) => {
    if (newQty < 1) return removeItem(id);
    const prev = items;
    setItems((cur) => cur.map((it) => (it.id === id ? { ...it, quantity: newQty } : it)));
    setPending(id, true);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc('update_cart_item_quantity', {
        cart_item_id_to_update: id,
        new_quantity: newQty,
      });
      setPending(id, false);
      if (error) {
        setItems(prev);
        show('更新失败，请重试', 'error');
      } else {
        router.refresh();
      }
    });
  };

  const removeItem = (id: number) => {
    const prev = items;
    setItems((cur) => cur.filter((it) => it.id !== id));
    setPending(id, true);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc('remove_item_from_cart', {
        cart_item_id_to_remove: id,
      });
      setPending(id, false);
      if (error) {
        setItems(prev);
        show('删除失败，请重试', 'error');
      } else {
        show('已移除商品', 'success');
        router.refresh();
      }
    });
  };

  const total = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const totalQty = items.reduce((acc, it) => acc + it.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center">
        <div className="text-6xl">🛒</div>
        <p className="mt-4 text-lg text-gray-700 font-medium">购物车是空的</p>
        <p className="mt-1 text-sm text-gray-500">去挑选喜欢的商品吧～</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 text-sm font-semibold shadow hover:shadow-lg transition-shadow"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
      <ul className="lg:col-span-7 divide-y divide-gray-200 rounded-2xl bg-white ring-1 ring-gray-100">
        {items.map((item) => {
          const pending = pendingIds.has(item.id);
          return (
            <li
              key={item.id}
              className={`flex p-4 sm:p-6 transition-all duration-300 ${pending ? 'opacity-60' : 'opacity-100'}`}
            >
              <Link href={`/product/${item.product.id}`} className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.image_url ?? ''}
                  alt={item.product.name}
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl object-cover bg-gray-100"
                />
              </Link>

              <div className="ml-4 sm:ml-6 flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <Link
                    href={`/product/${item.product.id}`}
                    className="text-sm sm:text-base font-medium text-gray-900 hover:text-indigo-600 line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    aria-label="删除"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <p className="mt-1 text-base font-bold text-gray-900">
                  <span className="text-sm text-gray-500 mr-0.5">¥</span>
                  {item.product.price}
                </p>

                <div className="mt-auto pt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="h-9 w-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-40 active:scale-90 transition"
                      disabled={pending}
                    >
                      −
                    </button>
                    <span className="w-9 text-center text-sm font-semibold text-gray-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="h-9 w-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-40 active:scale-90 transition"
                      disabled={pending}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    小计 <span className="text-indigo-600">¥{(item.product.price * item.quantity).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Summary */}
      <section className="mt-8 lg:mt-0 lg:col-span-5">
        <div className="sticky top-24 rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">订单总览</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <dt>商品数量</dt>
              <dd className="font-medium text-gray-900">{totalQty} 件</dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt>商品总价</dt>
              <dd className="font-medium text-gray-900">¥{total.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt>运费</dt>
              <dd className="font-medium text-green-600">免运费</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-4 text-base">
              <dt className="font-semibold text-gray-900">应付总计</dt>
              <dd className="font-extrabold text-indigo-600">¥{total.toFixed(2)}</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-[0.98] transition-all"
          >
            去结算 →
          </Link>
          <Link
            href="/"
            className="mt-3 w-full inline-flex items-center justify-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            ← 继续购物
          </Link>
        </div>
      </section>
    </div>
  );
}
