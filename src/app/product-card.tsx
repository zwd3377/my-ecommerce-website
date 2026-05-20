'use client';

import type { Product } from "@/lib/types";
import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { show } = useToast();

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        show('请先登录后再加入购物车', 'info');
        router.push('/login');
        return;
      }
      const { error } = await supabase.rpc('add_to_cart', {
        product_id_to_add: product.id,
      });
      if (error) {
        show('加入购物车失败', 'error');
      } else {
        show(`已加入「${product.name}」🛒`, 'success');
        router.refresh();
      }
    });
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              暂无图片
            </div>
          )}

          {/* Badge */}
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm">
            热销
          </span>

          {/* Quick add button (hover to reveal) */}
          <button
            type="button"
            onClick={quickAdd}
            disabled={isPending}
            aria-label="加入购物车"
            className="absolute right-3 bottom-3 h-10 w-10 inline-flex items-center justify-center rounded-full bg-white text-gray-900 shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-70 active:scale-90"
          >
            {isPending ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-lg font-bold text-gray-900">
              <span className="text-sm text-gray-500 mr-0.5">¥</span>
              {product.price}
            </p>
            <span className="text-xs text-gray-400">免运费</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
