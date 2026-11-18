<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { RouterLink, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useProductStore } from '@/store/product';
  import {
    ProductCard,
    BaseLayout,
    Header,
    SubHeader,
    Button,
    Badge,
  } from '@/components/ui';

  const router = useRouter();
  const productStore = useProductStore();
  const { products, loading, error } = storeToRefs(productStore);

  onMounted(() => {
    if (products.value.length === 0) {
      productStore.fetchAllProducts();
    }
  });

  const featuredProducts = computed(() => products.value.slice(0, 4));

  const onClickCategories = (categories: string) => {
    console.log(categories);
    router.push({
      name: 'products',
      query: { categories: categories },
    });
  };
</script>

<template>
  <BaseLayout class="gap-24">
    <section
      class="relative w-full rounded-3xl overflow-hidden p-8 md:p-12 shadow-lg bg-cover bg-center flex items-center min-h-[500px]"
      style="
        background-image: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80');
      "
    >
      <div class="absolute inset-0 bg-black/30"></div>
      <div
        class="relative flex flex-col gap-2 bg-white rounded-3xl p-8 md:p-10 shadow-2xl max-w-xl w-full my-4"
      >
        <Badge :primary="true" class="max-w-max">
          Anything What You Want
        </Badge>
        <div class="flex flex-col gap-2 mb-4">
          <Header> Ready to declutter your closet? </Header>
          <SubHeader>
            Turn your pre-loved clothing into cash instantly or explore rare
            thrift gems from verified vintage lovers nationwide.
          </SubHeader>
        </div>
        <div class="flex gap-2 flex-wrap">
          <RouterLink to="/products">
            <Button :primary="true"> Shop Now →</Button>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        class="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:-translate-y-0.5 transition-transform duration-200"
      >
        <div class="text-3xl mb-3">🚚</div>
        <h4 class="text-base font-bold mb-1.5 text-gray-900">
          Free Express Delivery
        </h4>
        <p class="text-sm text-gray-600 opacity-75 leading-relaxed">
          Complimentary shipping on orders over $100
        </p>
      </div>
      <div
        class="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:-translate-y-0.5 transition-transform duration-200"
      >
        <div class="text-3xl mb-3">🔒</div>
        <h4 class="text-base font-bold mb-1.5 text-gray-900">
          Secure Checkout
        </h4>
        <p class="text-sm text-gray-600 opacity-75 leading-relaxed">
          Encrypted transactions with standard protocols
        </p>
      </div>
      <div
        class="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:-translate-y-0.5 transition-transform duration-200"
      >
        <div class="text-3xl mb-3">🔄</div>
        <h4 class="text-base font-bold mb-1.5 text-gray-900">
          30-Day Guarantee
        </h4>
        <p class="text-sm text-gray-600 opacity-75 leading-relaxed">
          Hassle-free returns & instant refunds
        </p>
      </div>
      <div
        class="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:-translate-y-0.5 transition-transform duration-200"
      >
        <div class="text-3xl mb-3">💬</div>
        <h4 class="text-base font-bold mb-1.5 text-gray-900">
          24/7 Customer Care
        </h4>
        <p class="text-sm text-gray-600 opacity-75 leading-relaxed">
          Expert support anytime you need assistance
        </p>
      </div>
    </section>

    <section class="flex flex-col gap-6">
      <div
        class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4"
      >
        <div class="flex flex-col gap-2">
          <Header>Feature Product</Header>
          <SubHeader>
            Hand-picked top tier recommendations from our catalog
          </SubHeader>
        </div>
        <RouterLink
          to="/products"
          class="font-semibold text-[#42b883] hover:text-[#33a06f]"
        >
          See all products &rarr;
        </RouterLink>
      </div>

      <div v-if="loading" class="py-12 text-center text-sm text-gray-500">
        Loading products...
      </div>

      <div
        v-else-if="error"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <div
        v-else-if="featuredProducts.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <ProductCard
          v-for="product in featuredProducts"
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

      <div v-else class="py-12 text-center text-sm text-gray-500">
        No products yet.
        <RouterLink
          to="/products/add"
          class="font-semibold text-[#42b883] hover:underline"
        >
          Add your first product
        </RouterLink>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <div class="flex flex-col sm:justify-between gap-4">
        <div class="flex flex-col gap-2">
          <Header>Shop By Categories</Header>
          <SubHeader> Search by Categories in our Store </SubHeader>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button
            v-for="category in productStore.getCategory()"
            :key="category"
            @click="onClickCategories(category)"
            class="max-w-max"
          >
            {{ category }}
          </Button>
        </div>
      </div>
    </section>
  </BaseLayout>
</template>
