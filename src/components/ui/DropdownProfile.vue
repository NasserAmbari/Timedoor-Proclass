<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/store/auth';
  import { useUserStore } from '@/store/user';

  const router = useRouter();
  const isOpen = ref(false);

  const authStore = useAuthStore();
  const userStore = useUserStore();
  const { isLoggedIn } = storeToRefs(authStore);
  const { profile } = storeToRefs(userStore);

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const goToProfile = () => {
    isOpen.value = false;
    router.push('/profile');
  };

  const onClickLogout = () => {
    isOpen.value = false;
    authStore.logout();
    router.push('/login');
  };
</script>

<template>
  <div class="relative">
    <div v-if="isLoggedIn" class="relative">
      <div
        class="flex items-center gap-2 cursor-pointer select-none"
        @click="toggleDropdown"
      >
        <img
          :src="profile?.photo"
          alt="user"
          class="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-gray-500 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <div
        v-if="isOpen"
        class="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50"
      >
        <div class="px-4 py-2 border-b border-gray-100 mb-1">
          <p class="text-[10px] uppercase font-semibold text-gray-400">
            Signed in as
          </p>
          <p class="text-sm font-bold text-gray-800 truncate">
            {{ profile?.fullName }}
          </p>
        </div>

        <button
          @click="goToProfile"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Profile Settings
        </button>

        <!-- Menu Item: Logout -->
        <button
          @click="onClickLogout()"
          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </div>
  </div>
</template>
