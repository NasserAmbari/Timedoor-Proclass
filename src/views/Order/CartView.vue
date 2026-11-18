<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { RouterLink } from 'vue-router';
  import { useCart } from '@/composables/useCart';
  import { formatCurrency } from '@/utils/pricing';
  import { BaseLayout, Button, Header, SubHeader } from '@/components/ui';
  import { Trash, Cart } from '@/components/icons';
  // import { usePromo } from '@/composables/usePromo';

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    tax,
  } = useCart();

  const promoCodeInput = ref('');
  const promoApplied = ref(false);
  const promoError = ref('');

  const discount = computed(() =>
    promoApplied.value ? subtotal.value * 0.2 : 0,
  );

  const finalTotal = computed(() =>
    Math.max(0, subtotal.value - discount.value + shipping.value + tax.value),
  );

  const applyPromo = () => {
    if (promoCodeInput.value.trim().toUpperCase() === 'SUMMER20') {
      promoApplied.value = true;
      promoError.value = '';
    } else {
      promoError.value = 'Invalid promo code. Try "SUMMER20"';
    }
  };
</script>

<template>
  <BaseLayout>
    <div class="flex flex-col gap-2">
      <Header> Shopping Cart </Header>
      <SubHeader>
        Review your selected items before proceeding to checkout
      </SubHeader>
    </div>

    <!-- Active Cart -->
    <div
      v-if="cartItems.length > 0"
      class="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start"
    >
      <div
        class="flex flex-col gap-5 bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6"
      >
        <div
          class="hidden sm:grid grid-cols-[2fr_1fr_1fr_0.5fr] pb-3 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-400"
        >
          <span>Item</span>
          <span class="text-center">Quantity</span>
          <span class="text-right">Price</span>
          <span class="text-right">Action</span>
        </div>

        <div
          v-for="item in cartItems"
          :key="item.id"
          class="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_0.5fr] items-center gap-3 sm:gap-0 py-4 border-b border-gray-200 last:border-b-0"
        >
          <div class="flex items-center gap-4 min-w-0">
            <div
              class="flex shrink-0 items-center justify-center w-14 h-14 rounded-xl bg-gray-200/60 overflow-hidden text-2xl"
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
              <h4 class="text-sm font-bold text-gray-900 truncate mb-0.5">
                {{ item.title }}
              </h4>
              <span class="text-xs text-gray-500">
                {{ item.category }} &bull; {{ formatCurrency(item.price) }} each
              </span>
            </div>
          </div>

          <div class="flex items-center justify-start sm:justify-center gap-2">
            <button
              type="button"
              @click="updateQuantity(item.id, item.quantity - 1)"
              class="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-700 font-semibold hover:border-[#009688] hover:text-[#009688] transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span class="min-w-5 text-center text-sm font-bold text-gray-900">
              {{ item.quantity }}
            </span>
            <button
              type="button"
              @click="updateQuantity(item.id, item.quantity + 1)"
              class="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-700 font-semibold hover:border-[#009688] hover:text-[#009688] transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div
            class="text-left sm:text-right text-base font-bold text-gray-900"
          >
            {{ formatCurrency(item.price * item.quantity) }}
          </div>

          <div class="text-left sm:text-right">
            <button
              type="button"
              @click="removeFromCart(item.id)"
              class="text-lg opacity-60 hover:opacity-100 transition-opacity"
              title="Remove item"
              aria-label="Remove item"
            >
              <Trash />
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between pt-1">
          <RouterLink
            to="/products"
            class="text-sm font-semibold text-[#009688] hover:text-[#00897b]"
          >
            &larr; Continue Shopping
          </RouterLink>
          <Button :danger="true" @click="clearCart" class="max-w-max"
            >Clear Cart</Button
          >
        </div>
      </div>

      <!-- Order Summary -->
      <div
        class="flex flex-col gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-7 lg:sticky lg:top-6"
      >
        <h3 class="text-xl font-bold text-gray-900">Order Summary</h3>

        <div class="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{{ formatCurrency(subtotal) }}</span>
        </div>

        <div
          v-if="promoApplied"
          class="flex justify-between text-sm font-semibold text-emerald-500"
        >
          <span>Discount (20%)</span>
          <span>-{{ formatCurrency(discount) }}</span>
        </div>

        <div class="flex justify-between text-sm text-gray-600">
          <span>Estimated Shipping</span>
          <span>{{ shipping === 0 ? 'FREE' : formatCurrency(shipping) }}</span>
        </div>

        <div class="flex justify-between text-sm text-gray-600">
          <span>Estimated Tax</span>
          <span>{{ formatCurrency(tax) }}</span>
        </div>

        <div class="h-px bg-gray-200"></div>

        <div
          class="flex items-center justify-between text-lg font-bold text-gray-900"
        >
          <span>Total</span>
          <span class="text-2xl font-extrabold text-[#009688]">
            {{ formatCurrency(finalTotal) }}
          </span>
        </div>

        <!-- Promo -->
        <div class="flex flex-col gap-1.5 my-1">
          <div class="flex gap-2">
            <input
              v-model="promoCodeInput"
              type="text"
              placeholder="Promo code (SUMMER20)"
              :disabled="promoApplied"
              @keyup.enter="applyPromo"
              class="flex-1 min-w-0 px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#009688] focus:ring-1 focus:ring-[#009688] disabled:bg-gray-100 disabled:text-gray-400"
            />
            <Button
              :outline="true"
              @click="applyPromo"
              :disabled="promoApplied || !promoCodeInput"
              class="max-w-max"
            >
              {{ promoApplied ? 'Applied' : 'Apply' }}</Button
            >
          </div>
          <p v-if="promoError" class="text-xs text-red-500">{{ promoError }}</p>
          <p v-if="promoApplied" class="text-xs font-semibold text-emerald-500">
            ✓ 20% discount applied!
          </p>
        </div>

        <Button :primary="true">
          <RouterLink to="/checkout">
            Proceed to Checkout &rarr;
          </RouterLink></Button
        >
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center gap-3 text-center py-16 px-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300"
    >
      <Cart class="w-24 h-24 text-[#009688]"></Cart>
      <h2 class="text-2xl font-bold text-gray-900">
        Your cart is currently empty
      </h2>
      <p class="text-gray-500 mb-3">
        Explore our trending catalog and discover great products today.
      </p>
      <Button :primary="true">
        <RouterLink to="/products"> Start Shopping Now </RouterLink>
      </Button>
    </div>
  </BaseLayout>
</template>
