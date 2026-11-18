import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { calculateTotals } from '@/utils/pricing';
import type {
  OrderItem,
  PlacedOrder,
  OrderStatus,
  Order,
  CreateOrderInput,
} from '@/types/order';

const STATUSES: OrderStatus[] = ['pending', 'processing', 'done', 'cancelled'];

const toOrder = (id: string, data: DocumentData): Order => {
  const items: OrderItem[] = Array.isArray(data.items)
    ? data.items.map((i: DocumentData) => ({
        productId: String(i.productId ?? ''),
        title: String(i.title ?? ''),
        price: Number(i.price ?? 0),
        quantity: Number(i.quantity ?? 1),
        image: String(i.image ?? ''),
      }))
    : [];

  return {
    id,
    orderNumber: data.orderNumber ?? `ORD-${id.slice(0, 8).toUpperCase()}`,
    status: STATUSES.includes(data.status) ? data.status : 'pending',
    items,
    total: Number(data.total ?? 0),
    paymentMethod: data.paymentMethod ?? 'cod',
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
};

export async function getUserOrders(uid: string): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('userId', '==', uid));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => toOrder(d.id, d.data()))
    .sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
}

// Error khusus untuk masalah yang bisa diperbaiki user (bukan error jaringan)
export class CheckoutError extends Error {
  code: 'unavailable' | 'price-changed';
  details: { missingIds?: string[]; prices?: Record<string, number> };

  constructor(
    code: 'unavailable' | 'price-changed',
    message: string,
    details: { missingIds?: string[]; prices?: Record<string, number> } = {},
  ) {
    super(message);
    this.name = 'CheckoutError';
    this.code = code;
    this.details = details;
  }
}

export async function createOrder({
  uid,
  items,
  shipping,
  paymentMethod,
}: CreateOrderInput): Promise<PlacedOrder> {
  if (items.length === 0) throw new Error('Cart is empty');
  const pairs = await Promise.all(
    items.map(async (item) => ({
      item,
      snap: await getDoc(doc(db, 'products', item.id)),
    })),
  );

  const missingIds: string[] = [];
  const prices: Record<string, number> = {};
  let changed = false;

  for (const { item, snap } of pairs) {
    const current = snap.exists() ? Number(snap.data().price) : NaN;

    if (!Number.isFinite(current)) {
      missingIds.push(item.id);
      continue;
    }

    prices[item.id] = current;
    if (current !== item.price) changed = true;
  }

  if (missingIds.length > 0) {
    throw new CheckoutError('unavailable', 'Some items are unavailable', {
      missingIds,
    });
  }

  if (changed) {
    throw new CheckoutError('price-changed', 'Some prices have changed', {
      prices,
    });
  }

  const orderItems: OrderItem[] = items.map((item) => ({
    productId: item.id,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
    image: item.image ?? '',
  }));

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totals = calculateTotals(subtotal);

  const orderRef = doc(collection(db, 'orders'));
  const orderNumber = `ORD-${orderRef.id.slice(0, 8).toUpperCase()}`;

  await setDoc(orderRef, {
    userId: uid,
    orderNumber,
    status: 'pending',
    items: orderItems,
    shipping,
    paymentMethod,
    subtotal: totals.subtotal,
    shippingFee: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    createdAt: serverTimestamp(),
  });

  return {
    id: orderRef.id,
    orderNumber,
    total: totals.total,
    paymentMethod,
    shipping,
  };
}
