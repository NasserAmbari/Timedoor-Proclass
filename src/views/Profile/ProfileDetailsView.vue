<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useForm, useField } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';
  import { BaseFormInput, SubHeader } from '@/components/ui';
  import ProfileLayout from '@components/layout/ProfileLayout.vue';
  import { fileToAvatarDataUrl } from '@/utils/image';
  import { useAuthStore } from '@/store/auth';
  import { useUserStore } from '@/store/user';

  const MAX_PHOTO_SIZE = 500 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

  const auth = useAuthStore();
  const user = useUserStore();

  const pageLoading = ref(!user.isLoaded);
  const loadError = ref('');
  const email = ref(user.profile?.email ?? auth.user?.email ?? '');
  const photo = ref(user.profile?.photo ?? '');
  const photoError = ref('');
  const success = ref(false);
  const submitError = ref('');

  const fileInput = ref<HTMLInputElement | null>(null);
  let successTimer: ReturnType<typeof setTimeout> | undefined;

  const profileSchema = toTypedSchema(
    z.object({
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
    }),
  );

  // Set initialValues form langsung dari state user.profile
  const { handleSubmit, errors, isSubmitting, resetForm } = useForm({
    validationSchema: profileSchema,
    initialValues: {
      fullName: user.profile?.fullName ?? auth.user?.displayName ?? '',
      username: user.profile?.username,
    },
  });

  const { value: fullName } = useField<string>('fullName');
  const { value: userName } = useField<string>('username');

  onMounted(async () => {
    await auth.init();

    if (!auth.user) {
      pageLoading.value = false;
      loadError.value = 'Please log in to view your profile.';
      return;
    }

    await user.fetchProfile(auth.user.uid);

    if (user.error) {
      loadError.value = user.error;
      pageLoading.value = false;
      return;
    }

    const profile = user.profile;
    console.log('CHeck nilai sebentar:', {
      fullName: fullName.value,
      userName: userName.value,
      email: email.value,
      photo: photo.value,
    });
    if (profile) {
      resetForm({
        values: {
          fullName: profile.fullName || auth.user.displayName || '',
          username: profile.username,
        },
      });
      email.value = profile.email || auth.user.email || '';
      photo.value = profile.photo;
    }

    pageLoading.value = false;
  });

  onBeforeUnmount(() => clearTimeout(successTimer));

  async function onPhotoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;
    photoError.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      photoError.value = 'Only JPG, JPEG or PNG files are allowed.';
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      photoError.value = 'Photo must be 500 KB or smaller.';
      return;
    }

    try {
      photo.value = await fileToAvatarDataUrl(file);
    } catch {
      photoError.value = 'Could not read this image. Please try another one.';
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    submitError.value = '';
    success.value = false;
    if (!auth.user) return;

    try {
      await user.updateProfile(auth.user.uid, {
        fullName: values.fullName,
        username: values.username,
        photo: photo.value,
      });

      auth.user.displayName = values.fullName;
      resetForm({
        values: {
          fullName: values.fullName,
          username: values.username,
        },
      });

      success.value = true;
      clearTimeout(successTimer);
      successTimer = setTimeout(() => (success.value = false), 3000);
    } catch (e) {
      console.error(e);
      submitError.value =
        user.error || 'Failed to update your profile. Please try again.';
    }
  });
</script>

<template>
  <ProfileLayout>
    <SubHeader class="mb-8 font-bold">Edit Profile</SubHeader>

    <div v-if="pageLoading" class="py-16 text-center text-sm text-gray-500">
      Loading profile...
    </div>

    <div
      v-else-if="loadError"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ loadError }}
    </div>

    <form v-else @submit="onSubmit" novalidate>
      <!-- Photo -->
      <div
        class="flex flex-wrap items-center gap-4 pb-5 mb-5 border-b border-gray-200"
      >
        <span class="text-sm font-semibold text-gray-900 w-24">Photo</span>

        <div
          class="flex shrink-0 items-center justify-center w-14 h-14 rounded-full bg-teal-50 overflow-hidden"
        >
          <img
            v-if="photo"
            :src="photo"
            alt="Profile photo"
            class="w-full h-full object-cover"
          />
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-7 h-7 text-[#009688]"
          >
            <path
              d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"
            />
          </svg>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png"
          class="hidden"
          @change="onPhotoChange"
        />

        <button
          type="button"
          @click="fileInput?.click()"
          class="px-4 py-2 text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
        >
          Choose
        </button>

        <span class="text-xs text-gray-500">JPG, JPEG or PNG, 1 MB max.</span>

        <button
          v-if="photo"
          type="button"
          @click="photo = ''"
          class="ml-auto text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Remove photo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14M10 11v6m4-6v6"
            />
          </svg>
        </button>

        <p v-if="photoError" class="w-full text-sm text-red-500">
          {{ photoError }}
        </p>
      </div>

      <!-- Fields -->
      <BaseFormInput
        id="fullName"
        v-model="fullName"
        label="Full name"
        autocomplete="name"
        placeholder="Enter your full name"
        :error="errors.fullName"
        required
      />

      <BaseFormInput
        id="username"
        v-model="userName"
        label="Username"
        autocomplete="username"
        placeholder="Enter your username"
        :error="errors.username"
        required
      />

      <BaseFormInput
        id="email"
        :model-value="email"
        label="Email"
        type="email"
        hint="Email can't be changed here."
        readonly
      />

      <!-- Status -->
      <div
        v-if="success"
        class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        role="status"
      >
        Profile updated successfully.
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
          {{ isSubmitting ? 'Saving...' : 'Update Profile' }}
        </button>
      </div>
    </form>
  </ProfileLayout>
</template>
