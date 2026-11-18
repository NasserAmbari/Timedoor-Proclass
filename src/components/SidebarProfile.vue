<script setup lang="ts">
  import { RouterLink } from 'vue-router';
  import { Header, SubHeader } from '@components/ui';

  const links = [
    { to: '/profile', label: 'Profile details' },
    { to: '/change-password', label: 'Change Password' },
    { to: '/transaction-history', label: 'Transaction History' },
  ];
</script>

<template>
  <aside>
    <Header class="mb-5 md:mb-8">Settings</Header>

    <nav class="flex md:flex-col gap-5 overflow-x-auto" aria-label="Settings">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        custom
        v-slot="{ href, navigate, isActive }"
      >
        <a
          :href="href"
          @click="navigate"
          :aria-current="isActive ? 'page' : undefined"
          :class="[
            'text-sm whitespace-nowrap transition-colors',
            isActive
              ? 'font-semibold text-gray-900'
              : 'text-gray-500 hover:text-gray-900',
          ]"
        >
          {{ link.label }}
        </a>
      </RouterLink>
    </nav>
  </aside>
</template>
