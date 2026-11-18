<script setup lang="ts">
  import { RouterLink, RouterView } from 'vue-router';

  const links = [
    { to: '/settings/profile', label: 'Profile details' },
    { to: '/settings/password', label: 'Change Password' },
    { to: '/settings/orders', label: 'Transaction History' },
  ];
</script>

<template>
  <div class="bg-[#f4f4f5] min-h-[70vh]">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-start"
    >
      <aside>
        <h1 class="text-2xl font-medium text-gray-900 mb-5 md:mb-8">
          Settings
        </h1>

        <nav
          class="flex md:flex-col gap-5 overflow-x-auto"
          aria-label="Settings"
        >
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

      <section
        class="w-full max-w-3xl bg-white rounded-xl shadow-sm p-5 sm:p-6"
      >
        <RouterView />
      </section>
    </div>
  </div>
</template>
