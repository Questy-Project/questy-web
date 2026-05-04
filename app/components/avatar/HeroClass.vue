<script setup lang="ts">
defineProps<{ heroClass: string }>();
const color = '#f2ca50';
</script>

<template>
  <span
    class="inline-block text-xs font-semibold px-3 py-1 rounded-full border"
    :style="{
      color: color,
      borderColor: color + '66',
      backgroundColor: color + '15',
    }"
  >
    {{ heroClass }}
  </span>
</template>
