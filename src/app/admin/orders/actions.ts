'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const newStatus = formData.get('status') as string;

  if (!orderId || !newStatus || !orderStatuses.includes(newStatus)) {
    // In a real app, you'd want more robust error handling
    return;
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    // Handle error appropriately
    return;
  }

  // Revalidate paths to reflect the change immediately
  revalidatePath(`/admin/orders`);
  revalidatePath(`/admin/orders/${orderId}`);
}