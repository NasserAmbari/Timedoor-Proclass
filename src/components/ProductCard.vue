<script setup lang="ts">
  import { computed, ref, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAddToCart } from '@/composables/useAddToCart';
  import { HeartLike, Star, Cart } from '@components/icons';
  import { Button, Badge } from '@components/ui';
  import { formatCurrency } from '@/utils/pricing';

  import type { ProductCardProps } from '@/types/product';

  const props = withDefaults(defineProps<ProductCardProps>(), {
    rating: 0,
    liked: 0,
  });

  const router = useRouter();
  const { addProduct } = useAddToCart();

  const added = ref(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  const formattedPrice = computed(() => {
    return formatCurrency(props.price);
  });

  const handleAddToCart = () => {
    if (!props.id) return;

    const success = addProduct({
      id: props.id,
      title: props.title,
      description: props.description,
      price: props.price,
      category: props.category,
      image: props.image,
      liked: props.liked,
      rating: props.rating,
    });

    if (!success) return;

    added.value = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (added.value = false), 1200);
  };

  const goToDetail = () => {
    if (!props.id) return;
    router.push({ name: 'product-detail', params: { id: props.id } });
  };

  onBeforeUnmount(() => clearTimeout(resetTimer));
</script>

<template>
  <div
    class="flex flex-col w-full md:max-w-sm bg-white rounded-2xl overflow-hidden"
  >
    <div
      class="relative w-full aspect-[4/3] mb-5 overflow-hidden rounded-xl bg-[#f4f4f5] group"
    >
      <Badge :primary="true" class="absolute top-4 left-4 z-10 text-sm">{{
        category
      }}</Badge>

      <img
        v-if="image"
        :src="image"
        :alt="title"
        class="absolute inset-0 w-full h-full object-fit group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />

      <div
        v-else
        class="absolute inset-0 flex items-center justify-center text-4xl text-gray-300"
      >
        🛍️
      </div>
    </div>

    <div class="flex flex-col flex-1">
      <div class="flex items-center gap-4 mb-2">
        <div class="flex gap-1 items-center">
          <Star />
          <span class="text-sm font-semibold text-gray-900">{{ rating }}</span>
        </div>

        <div class="flex gap-1 items-center">
          <HeartLike />
          <span class="text-sm font-semibold text-gray-900">{{ liked }}</span>
        </div>
      </div>

      <h3 class="text-xl font-bold text-gray-900 mb-2 leading-snug">
        {{ title }}
      </h3>

      <p class="text-sm text-gray-500 mb-6 line-clamp-2">
        {{ description }}
      </p>

      <span class="text-2xl font-bold text-gray-900 mb-4">
        {{ formattedPrice }}
      </span>

      <div class="grid grid-cols-3 gap-3 mt-auto items-center">
        <Button
          :primary="true"
          :disabled="!id"
          @click="goToDetail"
          class="col-span-2"
          >Detail</Button
        >

        <Button
          :secondary="true"
          :disabled="!id"
          :aria-label="added ? 'Added to cart' : 'Add to cart'"
          @click="handleAddToCart"
          class="flex items-center justify-center"
        >
          <span v-if="added">✓</span>
          <Cart v-else />
        </Button>
      </div>
    </div>
  </div>
</template>
