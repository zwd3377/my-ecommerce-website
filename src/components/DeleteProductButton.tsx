'use client';

import { deleteProduct } from '@/app/admin/products/actions';

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        if (!confirm(`确定删除商品「${name}」吗？此操作不可撤销。`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 transition"
      >
        删除
      </button>
    </form>
  );
}
