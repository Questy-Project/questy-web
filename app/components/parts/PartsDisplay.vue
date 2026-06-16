<script setup lang="ts">
const props = defineProps<{ stock: number }>();

const hearts = computed(() =>
  Array.from({ length: 12 }, (_, i) => i < props.stock),
);
</script>

<template>
  <div class="grid grid-cols-6 justify-items-center gap-0.5 lg:gap-1 mx-auto">
    <span
      v-for="(full, i) in hearts"
      :key="i"
      class="text-base lg:text-2xl leading-none"
    >
      {{ full ? "❤️" : "🤍" }}
    </span>
  </div>
</template>
