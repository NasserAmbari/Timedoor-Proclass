export type PaymentMethod = 'bank-transfer' | 'e-wallet' | 'cod';
export type OrderStatus = 'pending' | 'processing' | 'done' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: Date | null;
}

export interface CreateOrderInput {
  uid: string;
  items: CartItem[];
  shipping: ShippingInfo;
  paymentMethod: PaymentMethod;
}

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  total: number;
  paymentMethod: PaymentMethod;
  shipping: ShippingInfo;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  category?: string;
  quantity: number;
}
