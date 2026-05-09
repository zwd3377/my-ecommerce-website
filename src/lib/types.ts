// Defines a product, used in multiple places.
export type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  description?: string | null; // Making description optional as not all queries fetch it
};

// Represents an item within an order.
export type OrderItem = {
  id: number;
  quantity: number;
  price: number; // Price at the time of order
  products: Product | null; // Can be null if product was deleted
};

// A summary of an order, used in lists.
export type OrderSummary = {
  id: number;
  created_at: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  // Optional fields that are only present in the admin list view
  user_id?: string;
  shipping_address?: {
    fullName?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  } | null;
};

// Type for the full, detailed order, used in order detail pages.
export type OrderDetails = {
  id: number;
  created_at: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: {
    fullName?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  } | null;
  order_items: OrderItem[];
  user_id?: string; // For admin queries
};