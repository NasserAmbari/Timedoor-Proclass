<script setup lang="ts">
  import { ref } from 'vue';
  import { RouterLink } from 'vue-router';
  import { useForm, useField } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';
  import {
    BaseFormInput,
    BaseLayout,
    Button,
    SubHeader,
    Header,
  } from '@/components/ui';
  import { useCart } from '@/composables/useCart';
  import { useAuthStore } from '@/store/auth';
  import { formatCurrency } from '@/utils/pricing';
  import { createOrder, CheckoutError } from '@/services/orderService';
  import type { PaymentMethod, PlacedOrder } from '@/types/order';

  const auth = useAuthStore();
  const {
    cartItems,
    subtotal,
    shipping,
    tax,
    total,
    clearCart,
    removeFromCart,
    updatePrices,
  } = useCart();

  const placedOrder = ref<PlacedOrder | null>(null);
  const submitError = ref('');

  const paymentOptions: {
    value: PaymentMethod;
    label: string;
    icon: string;
  }[] = [
    { value: 'bank-transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'e-wallet', label: 'E-Wallet', icon: '📱' },
    { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  ];

  const paymentLabel = (value: PaymentMethod) =>
    paymentOptions.find((o) => o.value === value)?.label ?? value;

  const checkoutSchema = toTypedSchema(
    z.object({
      fullName: z.string().trim().min(1, 'Full name is required'),
      email: z
        .string()
        .trim()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
      phone: z
        .string()
        .trim()
        .min(1, 'Phone number is required')
        .regex(/^\+?[0-9\s-]{9,16}$/, 'Please enter a valid phone number'),
      address: z
        .string()
        .trim()
        .min(1, 'Street address is required')
        .min(5, 'Address is too short'),
      city: z.string().trim().min(1, 'City is required'),
      postalCode: z
        .string()
        .trim()
        .min(1, 'Postal code is required')
        .regex(/^\d{5}$/, 'Postal code must be 5 digits'),
      paymentMethod: z.enum(['bank-transfer', 'e-wallet', 'cod']),
    }),
  );

  const { handleSubmit, errors, isSubmitting } = useForm({
    validationSchema: checkoutSchema,
    initialValues: {
      fullName: auth.user?.displayName ?? '',
      email: auth.user?.email ?? '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      paymentMethod: 'bank-transfer' as PaymentMethod,
    },
  });

  const { value: fullName } = useField<string>('fullName');
  const { value: email } = useField<string>('email');
  const { value: phone } = useField<string>('phone');
  const { value: address } = useField<string>('address');
  const { value: city } = useField<string>('city');
  const { value: postalCode } = useField<string>('postalCode');
  const { value: paymentMethod } = useField<PaymentMethod>('paymentMethod');

  const onSubmit = handleSubmit(async (values) => {
    submitError.value = '';

    if (!auth.user) {
      submitError.value = 'Please log in to place an order.';
      return;
    }

    try {
      placedOrder.value = await createOrder({
        uid: auth.user.uid,
        items: cartItems.value,
        shipping: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
          postalCode: values.postalCode,
        },
        paymentMethod: values.paymentMethod,
      });

      clearCart();
    } catch (e) {
      if (e instanceof CheckoutError && e.code === 'price-changed') {
        updatePrices(e.details.prices ?? {});
        submitError.value =
          'Prices for some items have changed. Your cart has been updated. Please review the new total and place your order again.';
      } else if (e instanceof CheckoutError && e.code === 'unavailable') {
        (e.details.missingIds ?? []).forEach((id) => removeFromCart(id));
        submitError.value =
          'Some items are no longer available and were removed from your cart.';
      } else {
        console.error(e);
        submitError.value =
          'Something went wrong while placing your order. Please try again.';
      }
    }
  });
</script>

<template>
  <BaseLayout>
    <template v-if="!placedOrder">
      <div class="flex flex-col gap-1.5">
        <Header> Checkout </Header>
        <SubHeader>
          Complete your shipping and payment information to finalize your order.
        </SubHeader>
      </div>

      <form
        v-if="cartItems.length > 0"
        @submit="onSubmit"
        novalidate
        class="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start"
      >
        <!-- Form -->
        <div class="flex flex-col gap-6">
          <section
            class="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-7"
          >
            <h3 class="text-lg font-bold text-gray-900 mb-5">
              1. Shipping Address
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
              <div class="sm:col-span-2">
                <BaseFormInput
                  id="fullName"
                  v-model="fullName"
                  label="Full Name"
                  autocomplete="name"
                  placeholder="Enter your full name"
                  :error="errors.fullName"
                  required
                />
              </div>

              <BaseFormInput
                id="email"
                v-model="email"
                label="Email Address"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                :error="errors.email"
                required
              />

              <BaseFormInput
                id="phone"
                v-model="phone"
                label="Phone Number"
                type="tel"
                autocomplete="tel"
                placeholder="08123456789"
                :error="errors.phone"
                required
              />

              <div class="sm:col-span-2">
                <BaseFormInput
                  id="address"
                  v-model="address"
                  label="Street Address"
                  autocomplete="street-address"
                  placeholder="Street, house number, district"
                  :error="errors.address"
                  required
                />
              </div>

              <BaseFormInput
                id="city"
                v-model="city"
                label="City"
                autocomplete="address-level2"
                placeholder="Balikpapan"
                :error="errors.city"
                required
              />

              <BaseFormInput
                id="postalCode"
                v-model="postalCode"
                label="Postal Code"
                autocomplete="postal-code"
                placeholder="76114"
                :error="errors.postalCode"
                required
              />
            </div>
          </section>

          <!-- Payment -->
          <section
            class="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-7"
          >
            <h3 class="text-lg font-bold text-gray-900 mb-5">
              2. Payment Method
            </h3>

            <div class="flex flex-col gap-3">
              <label
                v-for="option in paymentOptions"
                :key="option.value"
                :class="[
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-colors',
                  paymentMethod === option.value
                    ? 'border-[#009688] bg-[#009688]/5'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                ]"
              >
                <input
                  v-model="paymentMethod"
                  type="radio"
                  :value="option.value"
                  class="w-4 h-4 accent-[#009688]"
                />
                <span class="text-xl">{{ option.icon }}</span>
                <span class="text-sm font-semibold text-gray-900">
                  {{ option.label }}
                </span>
              </label>
            </div>

            <p v-if="errors.paymentMethod" class="mt-2 text-sm text-red-500">
              {{ errors.paymentMethod }}
            </p>
          </section>
        </div>

        <!-- Order review -->
        <aside
          class="flex flex-col gap-5 bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-7 lg:sticky lg:top-6"
        >
          <h3 class="text-lg font-bold text-gray-900">3. Order Review</h3>

          <div class="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="flex items-center justify-between gap-3 text-sm"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="flex shrink-0 items-center justify-center w-11 h-11 rounded-lg bg-gray-200/60 overflow-hidden"
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
                  <div class="font-semibold text-gray-900 truncate">
                    {{ item.title }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Qty: {{ item.quantity }}
                  </div>
                </div>
              </div>
              <div class="font-bold text-gray-900 shrink-0">
                {{ formatCurrency(item.price * item.quantity) }}
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2.5 pt-4 border-t border-gray-200">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>{{
                shipping === 0 ? 'FREE' : formatCurrency(shipping)
              }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>Tax</span>
              <span>{{ formatCurrency(tax) }}</span>
            </div>
            <div class="h-px bg-gray-200 my-1"></div>
            <div
              class="flex justify-between items-center text-lg font-bold text-gray-900"
            >
              <span>Total Due</span>
              <span class="text-xl font-extrabold text-[#009688]">
                {{ formatCurrency(total) }}
              </span>
            </div>
          </div>

          <div
            v-if="submitError"
            role="alert"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ submitError }}
          </div>

          <Button type="submit" :primary="true" :disabled="isSubmitting">
            {{
              isSubmitting
                ? 'Placing order...'
                : `Place Order (${formatCurrency(total)})`
            }}
          </Button>

          <RouterLink
            to="/cart"
            class="text-center text-sm font-semibold text-[#009688] hover:text-[#00897b]"
          >
            &larr; Return to Cart
          </RouterLink>
        </aside>
      </form>

      <!-- Cart Empty -->
      <div
        v-else
        class="flex flex-col items-center gap-3 text-center py-16 px-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300"
      >
        <div class="text-6xl">🛍️</div>
        <h3 class="text-2xl font-bold text-gray-900">No items to checkout</h3>
        <p class="text-gray-500 mb-3">
          Your shopping cart is empty. Please add items before proceeding.
        </p>
        <RouterLink
          to="/products"
          class="bg-[#009688] hover:bg-[#00897b] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          Browse Products
        </RouterLink>
      </div>
    </template>

    <!-- Comfirm Order -->
    <div
      v-else
      class="w-full max-w-xl mx-auto text-center bg-gray-50 border border-gray-200 rounded-2xl px-6 py-12 sm:px-10 shadow-sm"
    >
      <div class="text-6xl mb-4">🎉</div>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-3">Order Placed!</h2>
      <p class="text-gray-600 leading-relaxed mb-7">
        Thank you for your purchase,
        <strong class="text-gray-900">{{
          placedOrder.shipping.fullName
        }}</strong
        >. Your order has been recorded and is now pending.
      </p>

      <div
        class="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 px-4 py-4 mb-6 rounded-xl border border-dashed border-[#009688] bg-white"
      >
        <span class="text-sm text-gray-500">Order Reference ID:</span>
        <span class="text-lg font-extrabold tracking-wider text-[#009688]">
          {{ placedOrder.orderNumber }}
        </span>
      </div>

      <div class="text-sm text-gray-600 mb-8 space-y-3">
        <div>
          <h4 class="font-bold text-gray-900 mb-0.5">Shipping Destination</h4>
          <p>
            {{ placedOrder.shipping.address }}, {{ placedOrder.shipping.city }},
            {{ placedOrder.shipping.postalCode }}
          </p>
        </div>
        <div>
          <h4 class="font-bold text-gray-900 mb-0.5">Payment</h4>
          <p>
            {{ paymentLabel(placedOrder.paymentMethod) }} &bull;
            {{ formatCurrency(placedOrder.total) }}
          </p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-center gap-3">
        <RouterLink to="/products">
          <Button :primary="true">Continue Shopping</Button>
        </RouterLink>

        <RouterLink to="/"
          ><Button :outline="true"> Back to Home</Button>
        </RouterLink>
      </div>
    </div>
  </BaseLayout>
</template>
