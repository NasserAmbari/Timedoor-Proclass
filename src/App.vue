<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import Navbar from '@/components/Navbar.vue';
  import Footer from '@/components/Footer.vue';
</script>

<template>
  <div class="app-layout">
    <Navbar />

    <main class="main-content">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<style scoped>
  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    padding: 1.5rem 0;
  }
</style>
