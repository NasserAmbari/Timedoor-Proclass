export interface Product {
  id?: string;
  category?: string;
  image?: string;
  liked?: number;
  rating?: number;
  title: string;
  description: string;
  price: number | string;
}

export interface ProductCardProps {
  id?: string;
  category?: string;
  image?: string;
  liked?: number;
  rating?: number;
  title: string;
  description: string;
  price: number | string;
}

export type ProductPayload = Omit<Product, 'id'>;
export type ProductItem = Product & { id: string };
