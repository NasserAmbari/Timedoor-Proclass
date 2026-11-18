<script setup lang="ts">
  import { ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useForm, useField } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';
  import { BaseFormInput } from '@/components/ui';
  import { useProductStore } from '@/store/product';

  const productStore = useProductStore();
  const { error: storeError } = storeToRefs(productStore);
  const success = ref(false);

  // input kosong ('') dianggap belum diisi (undefined), bukan 0
  const toNumber = (v: unknown) =>
    v === '' || v === null || v === undefined ? undefined : Number(v);

  const productSchema = toTypedSchema(
    z.object({
      title: z
        .string()
        .trim()
        .min(1, 'Title is required')
        .min(3, 'Title must be at least 3 characters'),

      description: z.string().trim().min(1, 'Description is required'),

      price: z.preprocess(
        toNumber,
        z
          .number({ message: 'Price is required' })
          .min(0, 'Price must be 0 or more'),
      ),

      category: z.string().trim().optional(),

      image: z
        .string()
        .trim()
        .url('Please enter a valid URL (e.g. https://...)')
        .or(z.literal('')),

      rating: z.preprocess(
        toNumber,
        z
          .number({ message: 'Rating must be a number' })
          .min(0, 'Rating must be between 0 and 5')
          .max(5, 'Rating must be between 0 and 5')
          .optional(),
      ),

      liked: z.preprocess(
        toNumber,
        z
          .number({ message: 'Liked must be a number' })
          .int('Liked must be a whole number')
          .min(0, 'Liked must be 0 or more')
          .optional(),
      ),
    }),
  );

  const { handleSubmit, errors, isSubmitting, resetForm } = useForm({
    validationSchema: productSchema,
    initialValues: {
      title: '',
      description: '',
      price: '',
      category: '',
      image: '',
      rating: '',
      liked: '',
    },
  });

  const { value: title } = useField<string>('title');
  const { value: description } = useField<string>('description');
  const { value: price } = useField<string | number>('price');
  const { value: category } = useField<string>('category');
  const { value: image } = useField<string>('image');
  const { value: rating } = useField<string | number>('rating');
  const { value: liked } = useField<string | number>('liked');

  const onSubmit = handleSubmit(async (values) => {
    success.value = false;
    console.log(values);
    try {
      await productStore.createProduct({
        title: values.title,
        description: values.description,
        price: values.price,
        category: values.category ?? '',
        image: values.image ?? '',
        rating: values.rating,
        liked: values.liked,
      });

      resetForm();
      success.value = true;
    } catch {}
  });
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-10">
    <h1 class="mb-1 text-2xl font-semibold text-gray-800">Add Product</h1>
    <p class="mb-8 text-base text-gray-500">
      Fill in the product details, then save.
    </p>

    <div
      v-if="success"
      class="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
    >
      Product saved successfully.
    </div>

    <div
      v-if="storeError"
      class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ storeError }}
    </div>

    <form @submit="onSubmit" novalidate>
      <BaseFormInput
        id="title"
        v-model="title"
        label="Title"
        placeholder="e.g. Kopi Gayo 250gr"
        :error="errors.title"
        required
      />

      <div class="mb-6">
        <label
          for="description"
          class="mb-2 block text-sm font-medium text-gray-900"
        >
          Description <span class="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          v-model="description"
          rows="4"
          placeholder="Short product description"
          :class="[
            'w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-1',
            errors.description
              ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 text-gray-700 focus:border-[#009688] focus:ring-[#009688]',
          ]"
        />
        <span v-if="errors.description" class="mt-1 block text-sm text-red-500">
          {{ errors.description }}
        </span>
      </div>

      <BaseFormInput
        id="price"
        v-model="price"
        label="Price"
        type="number"
        placeholder="15000"
        :error="errors.price"
        required
      />

      <BaseFormInput
        id="category"
        v-model="category"
        label="Category"
        placeholder="e.g. drinks"
        :error="errors.category"
      />

      <BaseFormInput
        id="image"
        v-model="image"
        label="Image URL"
        type="url"
        placeholder="https://..."
        :error="errors.image"
      />

      <BaseFormInput
        id="rating"
        v-model="rating"
        label="Rating (0-5)"
        type="number"
        placeholder="e.g. 4.5"
        :error="errors.rating"
      />

      <BaseFormInput
        id="liked"
        v-model="liked"
        label="Liked"
        type="number"
        placeholder="e.g. 0"
        :error="errors.liked"
      />

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full rounded-lg bg-[#009688] px-4 py-3.5 font-medium text-white transition-colors duration-200 hover:bg-[#00897b] disabled:bg-gray-400"
      >
        {{ isSubmitting ? 'Saving...' : 'Save Product' }}
      </button>
    </form>
  </div>
</template>
