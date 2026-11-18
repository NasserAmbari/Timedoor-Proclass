<script setup lang="ts">
  import { computed } from 'vue';
  import { RouterLink } from 'vue-router';
  import { useCart } from '@/composables/useCart';
  import { Cart } from '@components/icons';

  const { totalCount } = useCart();

  // Tampilkan 99+ supaya badge tidak melebar
  const badgeText = computed(() =>
    totalCount.value > 99 ? '99+' : String(totalCount.value),
  );
</script>

<template>
  <RouterLink
    to="/cart"
    class="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[#009688] transition-colors"
    :aria-label="`Shopping cart, ${totalCount} items`"
  >
    <Cart class="w-5 h-5" />

    <span
      v-if="totalCount > 0"
      class="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#009688] text-white text-[10px] font-bold leading-none"
    >
      {{ badgeText }}
    </span>
  </RouterLink>
</template>
