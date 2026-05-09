// This is a client component because it uses interactivity (group-hover).
// In the future, we might add 'Add to Cart' buttons here, which also require it to be a client component.
'use client';

import type { Product } from "@/lib/types";
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} passHref>
      <div className="group relative border border-gray-200 rounded-lg p-4 transition-shadow duration-300 hover:shadow-xl">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-90 lg:aspect-none lg:h-80">
          <img
            src={product.image_url ?? ''}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mt-4 flex flex-col">
          <h3 className="text-base font-semibold text-gray-800">
              {product.name}
          </h3>
          <p className="text-lg font-bold text-gray-900 mt-2">${product.price}</p>
        </div>
      </div>
    </Link>
  );
}
