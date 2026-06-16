<script setup lang="ts">
defineProps<{ label?: string }>();
defineEmits<{ click: [] }>();
</script>

<template>
  <button
    class="text-base md:text-lg text-questy-light/80 mb-4 flex items-center gap-2
           font-medium hover:text-questy-gold transition-colors"
    @click="$emit('click')"
  >
    🔙 {{ label ?? 'Retour' }}
  </button>
</template>
