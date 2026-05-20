import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '@/components/ProductForm';
import { updateProduct } from '../../actions';

export const revalidate = 0;

interface Props {
  params: { id: string };
  searchParams: { message?: string };
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const admin = createAdminClient();
  const { data: product, error } = await admin
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !product) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500 flex items-center gap-2">
        <Link href="/admin/products" className="hover:text-indigo-600">商品管理</Link>
        <span>/</span>
        <span className="text-gray-700">编辑 #{product.id}</span>
      </nav>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">编辑商品</h1>
      <ProductForm
        action={updateProduct}
        initial={{
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
          description: product.description,
        }}
        message={searchParams?.message}
        submitLabel="💾 保存修改"
        pendingLabel="保存中…"
      />
    </div>
  );
}
