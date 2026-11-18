<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { RouterLink, useRouter } from 'vue-router';
  import { useAuthStore } from '@/store/auth';
  import { useCart } from '@/composables/useCart';
  import { getUserOrders } from '@/services/orderService';
  import ProfileLayout from '@components/layout/ProfileLayout.vue';
  import { Button, Header, SubHeader } from '@components/ui';
  import type { Order, OrderStatus } from '@/types/order';

  const router = useRouter();
  const auth = useAuthStore();
  const { addToCart } = useCart();

  const orders = ref<Order[]>([]);
  const loading = ref(true);
  const error = ref('');

  const statusMeta: Record<OrderStatus, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'bg-amber-50 text-amber-600' },
    processing: { label: 'Processing', class: 'bg-blue-50 text-blue-600' },
    done: { label: 'Done', class: 'bg-green-50 text-green-600' },
    cancelled: { label: 'Cancelled', class: 'bg-red-50 text-red-600' },
  };

  onMounted(async () => {
    if (!auth.user) return;

    try {
      orders.value = await getUserOrders(auth.user.uid);
    } catch (e) {
      console.error(e);
      error.value = 'Failed to load your orders. Please try again.';
    } finally {
      loading.value = false;
    }
  });

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (date: Date | null) =>
    date
      ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
      : '';

  const quantityText = (quantity: number, price: number) =>
    `${quantity} product${quantity > 1 ? 's' : ''} x ${formatPrice(price)}`;

  const moreText = (order: Order) => {
    const count = order.items.length - 1;
    return `+ ${count} more product${count > 1 ? 's' : ''}`;
  };

  // Masukkan semua item pesanan ke keranjang, lalu buka keranjang.
  // Harga akan diverifikasi ulang saat checkout.
  function buyAgain(order: Order) {
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart({
          id: item.productId,
          title: item.title,
          description: '',
          price: item.price,
          image: item.image,
          category: '',
        });
      }
    });

    router.push('/cart');
  }
</script>

<template>
  <ProfileLayout>
    <SubHeader class="mb-8 font-bold">My Order</SubHeader>

    <div v-if="loading" class="py-16 text-center text-sm text-gray-500">
      Loading orders...
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <div v-else-if="orders.length > 0" class="flex flex-col gap-4">
      <article
        v-for="order in orders"
        :key="order.id"
        class="rounded-lg border border-gray-200 p-4"
      >
        <header
          class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mb-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-4 h-4 text-[#009688]"
          >
            <path
              d="M7 8V7a5 5 0 0110 0v1h2a1 1 0 011 1l-1 11a2 2 0 01-2 2H7a2 2 0 01-2-2L4 9a1 1 0 011-1h2zm2 0h6V7a3 3 0 00-6 0v1z"
            />
          </svg>
          <span class="font-semibold text-gray-900">Shopping</span>
          <span>{{ formatDate(order.createdAt) }}</span>
          <span
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-semibold',
              statusMeta[order.status].class,
            ]"
          >
            {{ statusMeta[order.status].label }}
          </span>
          <span class="text-gray-500 break-all">{{ order.orderNumber }}</span>
        </header>

        <div
          class="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
        >
          <div class="min-w-0">
            <div
              v-for="item in order.items.slice(0, 1)"
              :key="item.productId"
              class="flex items-start gap-3"
            >
              <div
                class="flex shrink-0 items-center justify-center w-14 h-14 rounded-md bg-gray-100 overflow-hidden text-xl"
              >
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                />
                <span v-else>🛍️</span>
              </div>

              <div class="min-w-0">
                <h4 class="text-sm font-semibold text-gray-900 break-words">
                  {{ item.title }}
                </h4>
                <p class="text-xs text-gray-500 mt-1">
                  {{ quantityText(item.quantity, item.price) }}
                </p>
              </div>
            </div>

            <p v-if="order.items.length > 1" class="text-xs text-gray-500 mt-3">
              {{ moreText(order) }}
            </p>
          </div>

          <div class="sm:border-l sm:border-gray-200 sm:pl-6 sm:min-w-[140px]">
            <p class="text-xs text-gray-500">Total price</p>
            <p class="text-sm font-bold text-gray-900">
              {{ formatPrice(order.total) }}
            </p>
          </div>
        </div>

        <div class="flex justify-end pt-3 mt-3 border-t border-gray-200">
          <button
            type="button"
            @click="buyAgain(order)"
            class="bg-[#009688] hover:bg-[#00897b] text-white text-xs font-medium px-4 py-2 rounded-md transition-colors"
          >
            Buy Again
          </button>
        </div>
      </article>
    </div>

    <div v-else class="flex flex-col items-center text-center py-10 px-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-16 h-16 text-[#009688]/70 mb-4"
      >
        <path
          d="M7 8V7a5 5 0 0110 0v1h2a1 1 0 011 1l-1 11a2 2 0 01-2 2H7a2 2 0 01-2-2L4 9a1 1 0 011-1h2zm2 0h6V7a3 3 0 00-6 0v1z"
        />
      </svg>

      <h3 class="text-xl font-medium text-gray-900 mb-1">No orders yet</h3>
      <p class="text-xs text-gray-500 mb-5">
        When you buy an item, your order about it will appear here.
      </p>

      <RouterLink
        to="/products"
        class="bg-[#009688] hover:bg-[#00897b] text-white text-xs font-medium px-10 py-2.5 rounded-md transition-colors"
      >
        Shop now
      </RouterLink>
    </div>
  </ProfileLayout>
</template>
