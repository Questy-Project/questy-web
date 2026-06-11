<script setup lang="ts">
const props = defineProps<{
  color?: string;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}>();

const btnColor = computed(() => props.color ?? '#ffffff');
</script>

<template>
  <button
    v-if="variant === 'ghost'"
    class="px-4 py-3 rounded-xl text-sm text-gray-500 bg-gray-800/60 border border-gray-700
           transition-all duration-200
           hover:bg-gray-700/60 hover:text-gray-300 hover:border-gray-500
           disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="disabled"
  >
    <slot />
  </button>
  <button
    v-else
    class="rpg-btn py-3 rounded-xl font-bold text-sm uppercase tracking-widest border-2
           flex items-center justify-center gap-2
           disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.rpg-btn {
  background: #0f0f1a;
  border-color: v-bind(btnColor);
  color: v-bind(btnColor);
  box-shadow: 0 0 12px color-mix(in srgb, v-bind(btnColor) 33%, transparent);
  transition: box-shadow 0.2s ease, transform 0.15s ease, filter 0.2s ease;
}
.rpg-btn:not(:disabled):hover {
  box-shadow: 0 0 24px color-mix(in srgb, v-bind(btnColor) 65%, transparent),
              0 0 6px  color-mix(in srgb, v-bind(btnColor) 90%, transparent);
  transform: translateY(-2px);
  filter: brightness(1.15);
}
.rpg-btn:not(:disabled):active {
  transform: translateY(0);
  filter: brightness(0.95);
}
</style>
