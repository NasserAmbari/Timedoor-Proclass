<script setup lang="ts">
  import { BaseLayout } from '@/components/ui';
  import SidebarProfile from '@/components/SidebarProfile.vue';
</script>

<template>
  <BaseLayout>
    <div
      class="w-full grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-start"
    >
      <SidebarProfile />

      <section class="w-full bg-white rounded-xl shadow-sm p-5 sm:p-6">
        <slot></slot>
      </section>
    </div>
  </BaseLayout>
</template>
