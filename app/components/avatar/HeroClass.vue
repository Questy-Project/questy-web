<script setup lang="ts">
defineProps<{ heroClass: string }>();
</script>

<template>
  <span
    class="inline-block bg-questy-violet/20 text-questy-violet text-xs font-semibold px-3 py-1 rounded-full border border-questy-violet/40"
  >
    {{ heroClass }}
  </span>
</template>
