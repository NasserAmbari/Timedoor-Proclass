<script setup lang="ts">
  import { ref, onBeforeUnmount } from 'vue';
  import { useForm, useField } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';
  import { BaseFormInput, SubHeader } from '@/components/ui';
  import ProfileLayout from '@/components/layout/ProfileLayout.vue';
  import { changePassword } from '@/services/authService';

  const success = ref(false);
  const submitError = ref('');
  let successTimer: ReturnType<typeof setTimeout> | undefined;

  const schema = toTypedSchema(
    z
      .object({
        oldPassword: z.string().min(1, 'Old password is required'),
        newPassword: z
          .string()
          .min(1, 'New password is required')
          .min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
      })
      .refine((d) => d.newPassword === d.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
      })
      .refine((d) => d.newPassword !== d.oldPassword, {
        message: 'New password must be different from the old one',
        path: ['newPassword'],
      }),
  );

  const { handleSubmit, errors, isSubmitting, resetForm } = useForm({
    validationSchema: schema,
    initialValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const { value: oldPassword } = useField<string>('oldPassword');
  const { value: newPassword } = useField<string>('newPassword');
  const { value: confirmPassword } = useField<string>('confirmPassword');

  // Sunpah nda ngerti kenapa harus pakai ini wkwk?
  function mapError(e: unknown): string {
    const code = (e as { code?: string })?.code;

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Old password is incorrect.';
      case 'auth/weak-password':
        return 'New password is too weak.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/requires-recent-login':
        return 'Please log in again, then retry.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'Failed to change password. Please try again.';
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    submitError.value = '';
    success.value = false;

    try {
      await changePassword(values.oldPassword, values.newPassword);
      resetForm();
      success.value = true;
      clearTimeout(successTimer);
      successTimer = setTimeout(() => (success.value = false), 3000);
    } catch (e) {
      submitError.value = mapError(e);
    }
  });

  onBeforeUnmount(() => clearTimeout(successTimer));
</script>

<template>
  <ProfileLayout>
    <SubHeader class="mb-8 font-bold">Change Password</SubHeader>

    <form @submit="onSubmit" novalidate>
      <BaseFormInput
        id="oldPassword"
        v-model="oldPassword"
        label="Old Password"
        type="password"
        autocomplete="current-password"
        placeholder="Old password"
        :error="errors.oldPassword"
        required
      />

      <BaseFormInput
        id="newPassword"
        v-model="newPassword"
        label="New Password"
        type="password"
        autocomplete="new-password"
        placeholder="New password"
        :error="errors.newPassword"
        required
      />

      <BaseFormInput
        id="confirmPassword"
        v-model="confirmPassword"
        label="Confirmation New Password"
        type="password"
        autocomplete="new-password"
        placeholder="Confirmation password"
        :error="errors.confirmPassword"
        required
      />

      <div
        v-if="success"
        class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        role="status"
      >
        Password changed successfully.
      </div>

      <div
        v-if="submitError"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ submitError }}
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-[#009688] hover:bg-[#00897b] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </ProfileLayout>
</template>
