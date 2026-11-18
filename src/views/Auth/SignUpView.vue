<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useForm, useField } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { RouterLink, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import * as z from 'zod';

  import { BaseFormInput } from '@/components/ui';
  import { useAuthStore } from '@/store/auth';

  const router = useRouter();
  const authStore = useAuthStore();
  const { error: authError } = storeToRefs(authStore);

  onMounted(() => {
    authStore.error = null;
  });

  const signupSchema = toTypedSchema(
    z
      .object({
        fullName: z.string().trim().min(1, 'Full name is required'),
        username: z
          .string()
          .trim()
          .min(1, 'Username is required')
          .min(3, 'Username must be at least 3 characters')
          .regex(
            /^[a-zA-Z0-9_]+$/,
            'Only letters, numbers, and underscores are allowed',
          ),
        email: z
          .string()
          .min(1, 'Email is required')
          .email('Please enter a valid email address'),
        password: z
          .string()
          .min(1, 'Password is required')
          .min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        terms: z.boolean().refine((val) => val === true, {
          message: 'You must agree to the Terms & Conditions',
        }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
      }),
  );

  const { handleSubmit, errors, isSubmitting } = useForm({
    validationSchema: signupSchema,
    initialValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const { value: fullName } = useField<string>('fullName');
  const { value: username } = useField<string>('username');
  const { value: email } = useField<string>('email');
  const { value: password } = useField<string>('password');
  const { value: confirmPassword } = useField<string>('confirmPassword');
  const { value: terms } = useField<boolean>('terms');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authStore.register({
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
      });

      router.push('/');
    } catch {}
  });
</script>
<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div
      class="bg-white w-full max-w-[480px] p-8 md:p-10 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100"
    >
      <h1 class="text-2xl font-semibold text-gray-800 mb-2">
        Sign up for vintage
      </h1>
      <p class="text-gray-500 text-base mb-8">Enter your details below</p>

      <div
        v-if="authError"
        class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ authError }}
      </div>

      <form @submit="onSubmit">
        <BaseFormInput
          id="fullName"
          v-model="fullName"
          label="Full Name"
          autocomplete="name"
          placeholder="Enter your full name"
          :error="errors.fullName"
          required
        />

        <BaseFormInput
          id="username"
          v-model="username"
          label="Username"
          autocomplete="username"
          placeholder="Enter your username"
          :error="errors.username"
          required
        />

        <BaseFormInput
          id="email"
          v-model="email"
          label="Email"
          type="email"
          autocomplete="email"
          placeholder="Enter your email"
          :error="errors.email"
          required
        />

        <BaseFormInput
          id="password"
          v-model="password"
          label="Password"
          type="password"
          autocomplete="new-password"
          placeholder="Enter your password (min. 6 characters)"
          :error="errors.password"
          required
        />

        <BaseFormInput
          id="confirmPassword"
          v-model="confirmPassword"
          label="Confirmation Password"
          type="password"
          autocomplete="new-password"
          placeholder="Re-enter your password"
          :error="errors.confirmPassword"
          required
        />

        <div class="mb-6">
          <div class="flex items-start gap-2.5">
            <input
              id="terms"
              v-model="terms"
              type="checkbox"
              class="w-4 h-4 mt-0.5 text-[#009688] bg-gray-100 border-gray-300 rounded focus:ring-[#009688] focus:ring-2 cursor-pointer accent-[#009688]"
            />
            <label
              for="terms"
              class="text-xs text-gray-600 leading-relaxed cursor-pointer select-none"
            >
              By clicking sign up, I hereby agree and consent to
              <a href="#" class="text-[#009688] hover:underline"
                >Terms &amp; Conditions</a
              >; I confirm that I have read the
              <a href="#" class="text-[#009688] hover:underline"
                >Privacy policy</a
              >.
            </label>
          </div>
          <span v-if="errors.terms" class="text-sm text-red-500 mt-1 block">
            {{ errors.terms }}
          </span>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-[#009688] hover:bg-[#00897b] disabled:bg-gray-400 text-white font-medium py-3.5 px-4 rounded-lg transition-colors duration-200"
        >
          {{ isSubmitting ? 'Loading...' : 'Continue' }}
        </button>

        <p class="text-center text-sm text-gray-500 mt-6">
          Already have an account?
          <RouterLink
            to="/login"
            class="text-[#009688] font-medium hover:underline"
          >
            Login
          </RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
