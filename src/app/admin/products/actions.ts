'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function ensureAdmin() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Forbidden');
  }
}

function parseProductForm(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const priceRaw = formData.get('price');
  const price = priceRaw === null || priceRaw === '' ? NaN : Number(priceRaw);
  const image_url = String(formData.get('image_url') || '').trim() || null;
  const description = String(formData.get('description') || '').trim() || null;
  return { name, price, image_url, description };
}

export async function createProduct(formData: FormData) {
  await ensureAdmin();
  const { name, price, image_url, description } = parseProductForm(formData);
  if (!name || isNaN(price) || price < 0) {
    return redirect('/admin/products/new?message=请填写正确的商品名称和价格');
  }
  const admin = createAdminClient();
  const { error } = await admin.from('products').insert({ name, price, image_url, description });
  if (error) {
    return redirect(`/admin/products/new?message=创建失败：${encodeURIComponent(error.message)}`);
  }
  revalidatePath('/');
  revalidatePath('/admin/products');
  redirect('/admin/products?message=商品已创建');
}

export async function updateProduct(formData: FormData) {
  await ensureAdmin();
  const id = Number(formData.get('id'));
  const { name, price, image_url, description } = parseProductForm(formData);
  if (!id || !name || isNaN(price) || price < 0) {
    return redirect(`/admin/products/${id}/edit?message=请填写正确信息`);
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({ name, price, image_url, description })
    .eq('id', id);
  if (error) {
    return redirect(`/admin/products/${id}/edit?message=更新失败：${encodeURIComponent(error.message)}`);
  }
  revalidatePath('/');
  revalidatePath('/admin/products');
  revalidatePath(`/product/${id}`);
  redirect('/admin/products?message=商品已更新');
}

export async function deleteProduct(formData: FormData) {
  await ensureAdmin();
  const id = Number(formData.get('id'));
  if (!id) return;
  const admin = createAdminClient();
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) {
    return redirect(`/admin/products?message=删除失败：${encodeURIComponent(error.message)}`);
  }
  revalidatePath('/');
  revalidatePath('/admin/products');
  redirect('/admin/products?message=商品已删除');
}
