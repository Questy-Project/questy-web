<script setup lang="ts">
const props = defineProps<{ stock: number }>();

const hearts = computed(() =>
  Array.from({ length: 12 }, (_, i) => i < props.stock),
);
</script>

<template>
  <div class="flex flex-wrap gap-0.5">
    <span v-for="(full, i) in hearts" :key="i" class="text-base leading-none">
      {{ full ? "❤️" : "🤍" }}
    </span>
  </div>
</template>
