<script setup lang="ts">
  import { RouterLink } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { Logo, ArrowDown } from '@/components/icons';
  import { BadgeCart, DropdownProfile, Button } from '@components/ui';
  import { useAuthStore } from '@/store/auth';

  const authStore = useAuthStore();
  const { isLoggedIn } = storeToRefs(authStore);
</script>

<template>
  <nav
    class="w-full bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between"
  >
    <div class="flex items-center gap-4">
      <RouterLink to="/">
        <div class="flex items-center gap-2">
          <Logo />
          <span class="text-xl font-semibold text-[#009688] tracking-tight"
            >Vintage</span
          >
        </div>
      </RouterLink>

      <RouterLink to="/products">
        <span
          class="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >Products</span
        >
      </RouterLink>
    </div>

    <div class="flex items-center gap-4">
      <BadgeCart />
      <div class="h-8 w-px bg-gray-200 mx-1"></div>

      <div v-if="!isLoggedIn" class="flex gap-4">
        <RouterLink to="/login">
          <Button :primary="true"> Login </Button>
        </RouterLink>

        <RouterLink to="/sign-up">
          <Button :outline="true"> Sign up </Button>
        </RouterLink>
      </div>

      <DropdownProfile v-else></DropdownProfile>
    </div>
  </nav>
</template>
