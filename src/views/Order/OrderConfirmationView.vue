<template>
  <main class="w-full min-h-screen bg-[#f8f9fa] py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- BAGIAN KIRI: Detail Pesanan, Alamat, Pengiriman, Pembayaran -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <!-- Card 1: Order Items -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-sm font-semibold text-gray-900 mb-6">Order</h2>

            <div class="flex flex-col gap-6">
              <div
                v-for="(item, index) in orderItems"
                :key="index"
                class="flex items-center justify-between"
              >
                <div class="flex gap-4">
                  <!-- Product Image -->
                  <div
                    class="w-16 h-16 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0"
                  >
                    <img
                      :src="item.image"
                      :alt="item.title"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <!-- Product Info -->
                  <div class="flex flex-col justify-center">
                    <h3 class="text-sm font-semibold text-gray-900">
                      {{ item.title }}
                    </h3>
                    <p class="text-xs text-gray-500 my-0.5">{{ item.size }}</p>
                    <p class="text-sm font-bold text-gray-900">
                      {{ formatPrice(item.price) }}
                    </p>
                  </div>
                </div>
                <!-- Quantity -->
                <span class="text-sm text-gray-500 font-medium"
                  >x{{ item.quantity }}</span
                >
              </div>
            </div>
          </div>

          <!-- Card 2: Address -->
          <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">Address</h2>

            <div
              class="flex items-start gap-4 border border-gray-100 rounded-lg p-4"
            >
              <!-- Location Icon -->
              <div
                class="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div class="flex flex-col">
                <p class="text-sm font-bold text-gray-900">
                  {{ address.name }}
                </p>
                <p class="text-sm text-gray-500 mt-1 leading-relaxed">
                  {{ address.detail }}
                </p>
              </div>
            </div>
          </div>

          <!-- Card 3: Delivery Details -->
          <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">
              Delivery details
            </h2>

            <div
              class="flex items-start gap-4 border border-gray-100 rounded-lg p-4"
            >
              <!-- Shield Check Icon -->
              <div
                class="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div class="flex flex-col w-full">
                <div class="flex justify-between items-start mb-1">
                  <p class="text-sm font-bold text-gray-900">
                    {{ delivery.courier }}
                  </p>
                  <p class="text-sm font-bold text-gray-900">
                    {{ formatPrice(delivery.price) }}
                  </p>
                </div>
                <div
                  class="flex items-center gap-1.5 text-gray-500 text-xs mt-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{{ delivery.eta }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4: Payment Method -->
          <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">
              Payment Method
            </h2>

            <div
              class="flex items-start gap-4 border border-gray-100 rounded-lg p-4"
            >
              <!-- VISA Text Logo (Simple approximation) -->
              <div
                class="w-12 h-8 flex items-center justify-center flex-shrink-0"
              >
                <span
                  class="text-blue-700 font-extrabold text-xl italic tracking-tighter"
                  >VISA</span
                >
              </div>
              <div class="flex flex-col">
                <p class="text-sm font-bold text-gray-900 tracking-wider">
                  {{ payment.cardNumber }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ payment.expiry }} · {{ payment.cvv }}
                </p>
                <div class="flex items-center gap-1.5 mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <p class="text-xs text-gray-500">{{ payment.owner }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BAGIAN KANAN: Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-8">
            <h2 class="text-sm font-semibold text-gray-900 mb-6">
              Order summary
            </h2>

            <div class="flex flex-col gap-3 mb-6">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Order</span>
                <span class="text-gray-900 font-medium">{{
                  formatPrice(summary.orderTotal)
                }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Protection fee</span>
                <span class="text-gray-900 font-medium">{{
                  formatPrice(summary.protectionFee)
                }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Shipping</span>
                <span class="text-gray-900 font-medium">{{
                  formatPrice(summary.shipping)
                }}</span>
              </div>
            </div>

            <hr class="border-gray-100 mb-4" />

            <div class="flex justify-between items-center mb-8">
              <span class="text-sm font-bold text-gray-900">Total to pay</span>
              <span class="text-sm font-bold text-gray-900">{{
                formatPrice(totalToPay)
              }}</span>
            </div>

            <button
              class="w-full bg-[#009688] hover:bg-[#00897b] text-white font-medium py-3 rounded-md text-sm transition-colors shadow-sm"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue';

  // Data Mock berdasarkan referensi desain
  const orderItems = reactive([
    {
      image: 'https://placehold.co/150x150/e2e8f0/64748b?text=White',
      title: 'White crewneck',
      size: '8 / M',
      price: 200000,
      quantity: 1,
    },
    {
      image: 'https://placehold.co/150x150/e2e8f0/64748b?text=White',
      title: 'White crewneck',
      size: '8 / M',
      price: 200000,
      quantity: 1,
    },
  ]);

  const address = reactive({
    name: 'PT. Timedoor Indonesia',
    detail:
      'Jl. Tukad Yeh Aya IX No.46, Renon, Denpasar Selatan, Kota Denpasar, Bali 80226',
  });

  const delivery = reactive({
    courier: 'Fedex Express Shipping',
    price: 20000,
    eta: 'Home delivery in 1-3 working days',
  });

  const payment = reactive({
    cardNumber: '0819283210323',
    expiry: '23/12',
    cvv: '123',
    owner: 'Jack Daniel Arya',
  });

  const summary = reactive({
    orderTotal: 400000,
    protectionFee: 20000,
    shipping: 15000, // Di desain tertulis 15.000 untuk summary pengiriman[cite: 8]
  });

  const totalToPay = computed(() => {
    return summary.orderTotal + summary.protectionFee + summary.shipping;
  });

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace('Rp', 'Rp');
  };
</script>
