<script setup lang="ts">
  withDefaults(
    defineProps<{
      primary?: boolean;
      secondary?: boolean;
      outline?: boolean;
      danger?: boolean;
    }>(),
    {
      primary: false,
      secondary: false,
      outline: false,
      danger: false,
    },
  );
</script>

<template>
  <button
    type="button"
    :class="[
      'w-full px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 shadow-sm active:scale-95',
      {
        // Styling untuk Primary (Hijau Solid)
        'bg-[#009688] text-white border-[#009688] hover:bg-[#00897b]': primary,

        // Styling untuk Secondary (Abu-abu soft dengan transisi hover)
        'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200':
          secondary,

        // Styling untuk Outline (Hanya memiliki border, background transparan)
        'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400':
          outline,

        // Styling untuk Danger (Merah untuk hapus/peringatan)
        'bg-red-500 text-white border-red-500 hover:bg-red-600': danger,

        // Styling Default (Jika tidak ada prop yang dipanggil)
        'bg-white text-gray-800 border-gray-300 hover:bg-gray-50':
          !primary && !secondary && !outline && !danger,
      },
    ]"
  >
    <slot></slot>
  </button>
</template>
