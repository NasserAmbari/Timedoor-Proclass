import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { ProductPayload, ProductItem } from '@/types/product';

const productsRef = collection(db, 'products');

const toProductItem = (d: QueryDocumentSnapshot<DocumentData>): ProductItem => {
  const data = d.data();
  return {
    id: d.id,
    title: data.title ?? '',
    description: data.description ?? '',
    price: data.price ?? 0,
    category: data.category ?? '',
    image: data.image ?? '',
    liked: data.liked ?? 0,
    rating: data.rating ?? 0,
  };
};

export const createProduct = async (
  payload: ProductPayload,
): Promise<ProductItem> => {
  const data = {
    title: payload.title,
    description: payload.description,
    price: Number(payload.price),
    category: payload.category ?? '',
    image: payload.image ?? '',
    liked: payload.liked ?? 0,
    rating: payload.rating ?? 0,
  };

  const docRef = await addDoc(productsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...data };
};

export const getAllProducts = async (): Promise<ProductItem[]> => {
  const q = query(productsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(toProductItem);
};

export const getProductById = async (
  id: string,
): Promise<ProductItem | null> => {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? toProductItem(snap) : null;
};

export const getCategory = async () => {};
