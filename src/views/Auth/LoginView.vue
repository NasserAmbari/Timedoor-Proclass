<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useForm, useField } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';
  import { useRoute, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/store/auth';
  import { BaseFormInput } from '@/components/ui';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const { error: authError } = storeToRefs(authStore);

  onMounted(() => {
    authStore.error = null;
  });

  const loginSchema = toTypedSchema(
    z.object({
      email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),

      password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    }),
  );

  const { handleSubmit, errors, isSubmitting } = useForm({
    validationSchema: loginSchema,
    initialValues: {
      email: '',
      password: '',
    },
  });

  const { value: email } = useField<string>('email');
  const { value: password } = useField<string>('password');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authStore.login(values.email, values.password);
      const redirect = route.query.redirect;
      const target =
        typeof redirect === 'string' &&
        redirect.startsWith('/') &&
        !redirect.startsWith('//')
          ? redirect
          : '/';

      router.push(target);
    } catch {}
  });
</script>

<template>
  <div class="min-h-[100vh] flex items-center justify-center">
    <div
      class="bg-white w-full max-w-[440px] p-8 md:p-10 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100"
    >
      <h1 class="text-2xl font-semibold text-gray-800 mb-2">
        Login to vintage
      </h1>
      <p class="text-gray-500 text-base mb-8">Enter your details below</p>
      <div
        v-if="authError"
        class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ authError }}
      </div>

      <form @submit="onSubmit" novalidate>
        <div class="mb-6">
          <BaseFormInput
            id="email"
            v-model="email"
            label="Email"
            type="email"
            autocomplete="username"
            placeholder="Enter your email"
            :error="errors.email"
            required
          />
        </div>

        <div class="mb-8">
          <BaseFormInput
            id="password"
            v-model="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            :error="errors.password"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-[#009688] hover:bg-[#00897b] disabled:bg-gray-400 text-white font-medium py-3.5 px-4 rounded-lg transition-colors duration-200"
        >
          {{ isSubmitting ? 'Loading...' : 'Continue' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        Doesn't have any account?
        <RouterLink
          to="/sign-up"
          class="text-[#009688] font-medium hover:underline"
        >
          Sign Up
        </RouterLink>
      </p>
    </div>
  </div>
</template>
