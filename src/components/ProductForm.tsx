'use client';

import { useState } from 'react';
import SubmitButton from './SubmitButton';

interface Props {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    id?: number;
    name?: string;
    price?: number;
    image_url?: string | null;
    description?: string | null;
  };
  message?: string;
  submitLabel: string;
  pendingLabel: string;
}

const inputCls =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition';

export default function ProductForm({ action, initial, message, submitLabel, pendingLabel }: Props) {
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');

  return (
    <form action={action} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: fields */}
      <div className="lg:col-span-2 space-y-6">
        <section className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-6 space-y-5">
          {initial?.id != null && <input type="hidden" name="id" value={initial.id} />}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">商品名称 *</label>
            <input
              name="name"
              required
              defaultValue={initial?.name ?? ''}
              placeholder="例如：高品质蓝牙耳机"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">价格 (¥) *</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={initial?.price ?? ''}
              placeholder="0.00"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">商品图片 URL</label>
            <input
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
            <p className="mt-1.5 text-xs text-gray-400">支持任意公开图片链接</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">商品描述</label>
            <textarea
              name="description"
              rows={5}
              defaultValue={initial?.description ?? ''}
              placeholder="详细介绍商品的卖点、材质、尺寸等"
              className={inputCls}
            />
          </div>
          {message && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {message}
            </div>
          )}
        </section>
      </div>

      {/* Right: preview */}
      <aside className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-5 space-y-4">
          <p className="text-xs uppercase tracking-wider text-gray-400">实时预览</p>
          <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="预览" className="h-full w-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">填入图片 URL 后预览</span>
            )}
          </div>
          <SubmitButton pendingText={pendingLabel}>{submitLabel}</SubmitButton>
        </div>
      </aside>
    </form>
  );
}
