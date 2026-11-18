<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useRoute, useRouter, RouterLink } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useAddToCart } from '@/composables/useAddToCart';
  import { useProductStore } from '@/store/product';
  import { MagnifyingGlass, HeartLike, Star, Cart } from '@/components/icons';
  import {
    ProductCard,
    Button,
    Header,
    SubHeader,
    BaseLayout,
    Badge,
  } from '@/components/ui';
  import { formatCurrency } from '@/utils/pricing';

  const route = useRoute();
  const router = useRouter();
  const productStore = useProductStore();
  const { products, error } = storeToRefs(productStore);
  const { addProduct } = useAddToCart();

  const pageLoading = ref(true);
  const added = ref(false);
  const recentlyAddedId = ref<string | null>(null);

  const productId = computed(() => String(route.params.id));

  const product = computed(
    () => products.value.find((p) => p.id === productId.value) ?? null,
  );

  const otherProducts = computed(() => {
    const others = products.value.filter((p) => p.id !== productId.value);
    const sameCategory = others.filter(
      (p) => p.category && p.category === product.value?.category,
    );
    const rest = others.filter((p) => !sameCategory.includes(p));
    return [...sameCategory, ...rest].slice(0, 4);
  });

  async function load() {
    pageLoading.value = true;
    added.value = false;
    productStore.error = null;

    if (products.value.length === 0) {
      await productStore.fetchAllProducts();
    }

    if (!product.value) {
      await productStore.fetchProductById(productId.value);
    }

    pageLoading.value = false;
  }

  watch(productId, load, { immediate: true });

  const handleAddToCart = () => {
    if (!product.value) return;
    if (!addProduct(product.value)) return;

    added.value = true;
    setTimeout(() => (added.value = false), 1200);
  };

  const handleBuyNow = () => {
    if (!product.value) return;
    if (!addProduct(product.value)) return;

    router.push('/checkout');
  };
</script>

<template>
  <BaseLayout>
    <RouterLink
      to="/products"
      class="inline-block mb-6 text-sm text-gray-500 hover:text-[#009688]"
    >
      &larr; Back to products
    </RouterLink>

    <div v-if="pageLoading" class="py-24 text-center text-sm text-gray-500">
      Loading product...
    </div>

    <div
      v-else-if="!product"
      class="flex flex-col items-center justify-center gap-1 text-center py-20 px-5 rounded-2xl border border-dashed border-gray-300"
    >
      <MagnifyingGlass></MagnifyingGlass>
      <h2 class="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
      <p class="text-sm text-gray-500 mb-6">
        {{
          error ||
          "The product you're looking for doesn't exist or has been removed."
        }}
      </p>
      <RouterLink to="/products">
        <Button :primary="true"> Back to Products</Button>
      </RouterLink>
    </div>

    <template v-else>
      <section
        class="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 mb-16"
      >
        <div
          class="w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
        >
          <img
            :src="
              product.image ||
              'https://placehold.co/800x600/e2e8f0/64748b?text=No+Image'
            "
            :alt="product.title"
            class="w-full h-auto object-cover aspect-[4/3]"
          />
        </div>

        <div class="flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(product.price) }}
            </h1>

            <span class="flex items-center gap-1.5 text-sm text-gray-400">
              <HeartLike />
              {{ product.liked ?? 0 }}
            </span>
          </div>

          <h2 class="text-lg text-gray-800 mb-3">{{ product.title }}</h2>

          <div class="flex items-center gap-2 mb-6">
            <div class="flex">
              <Star
                v-for="i in 5"
                :key="i"
                :class="
                  i <= Math.round(product.rating ?? 0)
                    ? '!fill-amber-400'
                    : '!fill-gray-200'
                "
              />
            </div>
            <span class="text-xs text-gray-500">
              {{ Number(product.rating ?? 0).toFixed(1) }}
            </span>
          </div>

          <hr class="border-gray-100 mb-6" />

          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">
              Item Description
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              {{ product.description }}
            </p>
          </div>

          <div
            v-if="product.category"
            class="grid grid-cols-[100px_1fr] gap-y-4 text-sm mb-8"
          >
            <span class="text-gray-500">Category</span>
            <Badge :primary="true" class="max-w-max">{{
              product.category
            }}</Badge>
            <span class="text-gray-800"></span>
          </div>

          <div class="flex flex-col gap-3">
            <Button :primary="true" @click="handleBuyNow"> Buy Now </Button>
            <Button :outline="true" @click="handleAddToCart">
              <span v-if="added">Added ✓</span>
              <span v-else class="flex flex items-center justify-center gap-2">
                <span>Add to Cart</span>
                <Cart class="w-4 h-4" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      <section v-if="otherProducts.length > 0">
        <div class="flex flex-col gap-2 mb-6">
          <Header>Other Product</Header>
          <SubHeader>Check Our Another Products</SubHeader>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="item in otherProducts"
            :key="item.id"
            class="h-full cursor-pointer"
          >
            <ProductCard
              :category="item.category"
              :image="item.image"
              :price="item.price"
              :title="item.title"
              :description="item.description"
              :rating="item.rating"
              :liked="item.liked"
              :added="recentlyAddedId === item.id"
            />
          </div>
        </div>
      </section>
    </template>
  </BaseLayout>
</template>
