import { ref, computed, watch } from 'vue';
import type { ProductItem } from '@/types/product';
import { calculateTotals } from '@/utils/pricing';
import type { CartItem } from '@/types/order';

const STORAGE_PREFIX = 'vintage-cart';

const keyFor = (uid: string) => `${STORAGE_PREFIX}:${uid}`;

try {
  localStorage.removeItem(STORAGE_PREFIX);
  localStorage.removeItem(`${STORAGE_PREFIX}:guest`);
} catch {
  // abaikan
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.price === 'number' &&
    Number.isFinite(v.price) &&
    typeof v.quantity === 'number' &&
    Number.isInteger(v.quantity) &&
    v.quantity > 0
  );
}

function loadCart(key: string): CartItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function persist(key: string, items: CartItem[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // storage penuh atau diblokir: keranjang tetap jalan, hanya tidak tersimpan
  }
}

// Key milik user yang sedang login. null = belum login (tidak ada keranjang)
let currentKey: string | null = null;

// Global Reactive Cart State
const cartItems = ref<CartItem[]>([]);

// Simpan otomatis ke key milik user. flush 'sync' agar tidak ada jeda
// yang bisa membuat data tersimpan ke key user yang salah saat berganti akun.
watch(
  cartItems,
  (items) => {
    if (currentKey) persist(currentKey, items);
  },
  { deep: true, flush: 'sync' },
);

// Sinkron antar tab untuk user yang sedang login
window.addEventListener('storage', (e) => {
  if (currentKey && e.key === currentKey) {
    cartItems.value = loadCart(currentKey);
  }
});

/**
 * Pindah ke keranjang milik user (uid), atau kosongkan saat logout (null).
 * Dipanggil dari auth store setiap kali status login berubah.
 */
export function switchCart(uid: string | null) {
  const nextKey = uid ? keyFor(uid) : null;
  if (nextKey === currentKey) return;

  // Key diganti lebih dulu supaya data lama tidak tertulis ke key baru
  currentKey = nextKey;
  cartItems.value = nextKey ? loadCart(nextKey) : [];
}

export function useCart() {
  const addToCart = (product: ProductItem) => {
    if (!currentKey) return; // tanpa login tidak ada keranjang

    const existing = cartItems.value.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
      return;
    }

    const price = Number(product.price);

    cartItems.value.push({
      id: product.id,
      title: product.title,
      price: Number.isFinite(price) ? price : 0,
      image: product.image,
      category: product.category,
      quantity: 1,
    });
  };

  const removeFromCart = (productId: string) => {
    cartItems.value = cartItems.value.filter((item) => item.id !== productId);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.value.find((item) => item.id === productId);
    if (item) item.quantity = quantity;
  };

  const updatePrices = (prices: Record<string, number>) => {
    cartItems.value.forEach((item) => {
      const price = prices[item.id];
      if (typeof price === 'number') item.price = price;
    });
  };

  const clearCart = () => {
    cartItems.value = [];
  };

  const totalCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  const subtotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  const totals = computed(() => calculateTotals(subtotal.value));
  const shipping = computed(() => totals.value.shipping);
  const tax = computed(() => totals.value.tax);
  const total = computed(() => totals.value.total);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updatePrices,
    clearCart,
    totalCount,
    subtotal,
    shipping,
    tax,
    total,
  };
}
