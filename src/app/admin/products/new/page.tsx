import Link from 'next/link';
import ProductForm from '@/components/ProductForm';
import { createProduct } from '../actions';

export default function NewProductPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500 flex items-center gap-2">
        <Link href="/admin/products" className="hover:text-indigo-600">商品管理</Link>
        <span>/</span>
        <span className="text-gray-700">新增商品</span>
      </nav>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">新增商品</h1>
      <ProductForm
        action={createProduct}
        message={searchParams?.message}
        submitLabel="✨ 上架商品"
        pendingLabel="正在上架…"
      />
    </div>
  );
}
