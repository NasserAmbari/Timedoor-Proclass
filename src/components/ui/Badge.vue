<script setup lang="ts">
  withDefaults(
    defineProps<{
      success?: boolean;
      danger?: boolean;
      warning?: boolean;
      info?: boolean;
      primary?: boolean;
      neutral?: boolean;
    }>(),
    {
      success: false,
      danger: false,
      warning: false,
      info: false,
      primary: false,
      neutral: false,
    },
  );
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold transition-colors',
      {
        'bg-green-100 text-green-700': success,

        // Varian Danger (Merah - Cocok untuk Gagal / Cancelled)
        'bg-red-100 text-red-700': danger,

        // Varian Warning (Kuning/Amber - Cocok untuk Pending / Menunggu)
        'bg-amber-100 text-amber-700': warning,

        // Varian Info (Biru - Cocok untuk Informasi / Proses)
        'bg-blue-100 text-blue-700': info,

        // Varian Primary (Teal - Mengikuti warna tema utama aplikasi Vintage)
        'bg-teal-100 text-teal-700': primary,

        // Varian Neutral / Default (Abu-abu)
        'bg-gray-100 text-gray-700':
          neutral || (!success && !danger && !warning && !info && !primary),
      },
    ]"
  >
    <slot></slot>
  </span>
</template>
