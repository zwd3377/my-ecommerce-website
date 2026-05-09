import type { Product } from "@/lib/types";

// This is a client component because it uses interactivity (group-hover).
// In the future, we might add 'Add to Cart' buttons here, which also require it to be a client component.
'use client';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div key={product.id} className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url ?? ''}
          alt={product.name} // It's better to use product.name for alt text
          className="h-full w-full object-cover object-center lg:h-full lg:w-full"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <a href={`/product/${product.id}`}> {/* Link to a dynamic product page */}
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </a>
          </h3>
          {/* We could add product.description or other details here later */}
        </div>
        <p className="text-sm font-medium text-gray-900">${product.price}</p>
      </div>
    </div>
  );
}