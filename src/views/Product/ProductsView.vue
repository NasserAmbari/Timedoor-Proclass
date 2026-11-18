<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useProductStore } from '@/store/product';
  import { useRoute } from 'vue-router';
  import {
    ProductCard,
    BaseLayout,
    Header,
    SubHeader,
    Button,
  } from '@/components/ui';

  const route = useRoute();
  const productStore = useProductStore();
  const { products, loading, error } = storeToRefs(productStore);

  const selectedCategory = ref(route.query.categories || 'All');
  const searchQuery = ref('');

  onMounted(() => {
    productStore.fetchAllProducts();
  });

  const filteredProducts = computed(() => {
    const query = searchQuery.value.toLowerCase();

    return products.value.filter((product) => {
      const matchesCategory =
        selectedCategory.value === 'All' ||
        product.category === selectedCategory.value;

      const matchesSearch =
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  });

  const resetFilters = () => {
    searchQuery.value = '';
    selectedCategory.value = 'All';
  };
</script>

<template>
  <BaseLayout>
    <div class="flex flex-col gap-2">
      <Header>Catalog & Products</Header>
      <SubHeader>
        Browse our full range of curated products with instant checkout ready.
      </SubHeader>
    </div>

    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
    >
      <div class="relative w-full lg:max-w-md">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products by title or keywords..."
          class="w-full py-3 pl-11 pr-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
        />

        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          aria-label="Clear search"
        >
          ✕
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button
          v-for="category in productStore.getCategory()"
          :key="category"
          @click="selectedCategory = category"
          :primary="selectedCategory === category"
          :outline="selectedCategory !== category"
          class="max-w-max"
        >
          {{ category }}
        </Button>
      </div>
    </div>

    <div v-if="loading" class="py-20 text-center text-sm text-gray-500">
      Loading products...
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Daftar produk -->
    <div
      v-else-if="filteredProducts.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :title="product.title"
        :description="product.description"
        :price="product.price"
        :image="product.image"
        :category="product.category"
        :rating="product.rating"
        :liked="product.liked"
        :id="product.id"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center text-center py-20 px-5 bg-white rounded-2xl border border-dashed border-gray-300"
    >
      <div class="text-5xl mb-5">🔎</div>

      <h3 class="text-xl font-bold text-gray-800 mb-2">Product Not Found</h3>

      <p class="text-sm text-gray-500 mb-6">
        We couldn't find any products matching your search or selected category.
      </p>

      <button
        type="button"
        @click="resetFilters"
        class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition"
      >
        Reset Filters
      </button>
    </div>
  </BaseLayout>
</template>
