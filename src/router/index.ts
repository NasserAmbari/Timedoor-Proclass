import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

import HomeView from '@/views/HomeView.vue';

//Prodcut
import ProductsView from '@/views/Product/ProductsView.vue';
import AddProductView from '@/views/Product/AddProductView.vue';
import ProductDetailView from '@/views/Product/ProductDetailView.vue';

//Order
import CartView from '@/views/Order/CartView.vue';
import CheckoutView from '@/views/Order/CheckoutView.vue';

//Auth
import LoginView from '@/views/Auth/LoginView.vue';
import SignUpView from '@/views/Auth/SignUpView.vue';

//Profile
import ProfileDetailsView from '@/views/Profile/ProfileDetailsView.vue';
import TransactionHistoryView from '@/views/Profile/TransactionHistoryView.vue';
import ChangePasswordView from '@/views/Profile/ChangePasswordView.vue';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean; // harus login
    requiresAdmin?: boolean; // harus login dan role admin
    guestOnly?: boolean; // hanya untuk yang belum login
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Publik: siapa saja boleh membuka
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: ProductDetailView,
    },

    // Khusus tamu
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: SignUpView,
      meta: { guestOnly: true },
    },

    // Harus login
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileDetailsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/transaction-history',
      name: 'transaction-history',
      component: TransactionHistoryView,
      meta: { requiresAuth: true },
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: ChangePasswordView,
      meta: { requiresAuth: true },
    },

    // Harus admin
    {
      path: '/add-product',
      name: 'add-product',
      component: AddProductView,
      meta: { requiresAdmin: true },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.init();

  // 1. Butuh login tapi belum login
  if ((to.meta.requiresAuth || to.meta.requiresAdmin) && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  // 2. Butuh admin tapi bukan admin
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { path: '/' };
  }

  // 3. Halaman khusus tamu tapi sudah login
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { path: '/' };
  }
});

export default router;
