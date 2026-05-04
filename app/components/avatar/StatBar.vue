<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: number;
  maxValue: number;
  align?: "left" | "right";
  description?: string;
}>();

const width = computed(() =>
  props.maxValue > 0 ? Math.round((props.value / props.maxValue) * 100) : 0,
);
const isRight = computed(() => props.align === "right");
</script>

<template>
  <div>
    <div class="flex justify-between text-xs mb-1">
      <span v-if="!isRight" class="text-questy-light/80">{{ label }}</span>
      <span class="font-bold text-questy-gold">
        {{ value.toLocaleString("fr-FR") }}
      </span>
      <span v-if="isRight" class="text-questy-light/80">{{ label }}</span>
    </div>
    <div class="bg-questy-sheet rounded-full h-1.5">
      <div
        class="h-full rounded-full bg-questy-gold transition-all duration-500"
        :style="{ width: `${width}%` }"
      />
    </div>
    <p v-if="description" class="text-xs text-questy-light/40 mt-0.5">
      {{ description }}
    </p>
  </div>
</template>
