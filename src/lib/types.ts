// Based on your database schema and usage in the page.tsx file.
// You can adjust this if your 'products' table has different columns.
export type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
};