import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useCart } from '@/composables/useCart';
import type { ProductItem } from '@/types/product';

export function useAddToCart() {
  const router = useRouter();
  const route = useRoute();
  const auth = useAuthStore();
  const { addToCart } = useCart();

  // Guard Login
  const requireLogin = (): boolean => {
    if (auth.isLoggedIn) return true;

    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return false;
  };

  // Mengembalikan true kalau produk benar-benar masuk keranjang
  const addProduct = (product: ProductItem): boolean => {
    if (!requireLogin()) return false;

    addToCart(product);
    return true;
  };

  return { addProduct, requireLogin };
}
