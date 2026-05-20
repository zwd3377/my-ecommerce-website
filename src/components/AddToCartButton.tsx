'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';
import { createClient } from '@/lib/supabase/client';

interface Props {
  productId: number;
  className?: string;
  label?: string;
}

export default function AddToCartButton({ productId, className, label = '加入购物车' }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { show } = useToast();

  const onClick = () => {
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        show('请先登录后再加入购物车', 'info');
        router.push('/login');
        return;
      }
      const { error } = await supabase.rpc('add_to_cart', {
        product_id_to_add: productId,
      });
      if (error) {
        show('加入购物车失败，请重试', 'error');
        return;
      }
      show('已加入购物车 🛒', 'success');
      // Refresh server components (Header badge / cart page)
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={
        className ??
        'w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-6 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed'
      }
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span>加入中…</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.763.746-1.858 1.705l-1.262 12.62A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.858-2.42l-1.262-12.62A1.875 1.875 0 0018.487 6.75H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3z" clipRule="evenodd" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
