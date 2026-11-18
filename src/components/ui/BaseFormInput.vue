<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { EyeIcon, EyeOffIcon } from '@components/icons';

  const props = withDefaults(
    defineProps<{
      id: string;
      label: string;
      type?: string;
      placeholder?: string;
      error?: string;
      hint?: string;
      required?: boolean;
      readonly?: boolean;
      autocomplete?: string;
    }>(),
    {
      type: 'text',
      placeholder: '',
      error: '',
      hint: '',
      required: false,
      readonly: false,
    },
  );

  const model = defineModel<string | any>();

  const showPassword = ref(false);
  const isPassword = computed(() => props.type === 'password');

  const currentType = computed(() => {
    if (isPassword.value) {
      return showPassword.value ? 'text' : 'password';
    }
    return props.type;
  });

  const togglePassword = () => {
    showPassword.value = !showPassword.value;
  };
</script>

<template>
  <div class="mb-6">
    <label :for="id" class="block text-sm font-medium text-gray-900 mb-2">
      {{ label }}
      <span v-if="required && !readonly" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        :id="id"
        v-model="model"
        :type="currentType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :readonly="readonly"
        :class="[
          'w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors',
          isPassword ? 'pr-12' : '',
          readonly
            ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
            : error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900'
              : 'border-gray-200 focus:border-[#009688] focus:ring-1 focus:ring-[#009688] text-gray-700',
        ]"
      />

      <button
        v-if="isPassword"
        type="button"
        @click="togglePassword"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Toggle password visibility"
      >
        <EyeIcon v-if="!showPassword" />
        <EyeOffIcon v-else />
      </button>
    </div>

    <span v-if="error" class="text-sm text-red-500 mt-1 block">
      {{ error }}
    </span>
    <span v-else-if="hint" class="text-xs text-gray-400 mt-1 block">
      {{ hint }}
    </span>
  </div>
</template>
