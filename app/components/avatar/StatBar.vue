<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: number;
  maxValue: number;
  align?: "left" | "right";
  description?: string;
  large?: boolean;
  color?: string;
}>();

const width = computed(() =>
  props.maxValue > 0 ? Math.round((props.value / props.maxValue) * 100) : 0,
);
const isRight = computed(() => props.align === "right");
const barColor = computed(() => props.color ?? '#f2ca50');
</script>

<template>
  <div>
    <div :class="['flex justify-between mb-1', large ? 'text-sm' : 'text-xs']">
      <span v-if="!isRight" class="text-questy-light/80">{{ label }}</span>
      <span class="font-bold" :style="{ color: barColor }">
        {{ value.toLocaleString("fr-FR") }}
      </span>
      <span v-if="isRight" class="text-questy-light/80">{{ label }}</span>
    </div>
    <div :class="['bg-questy-sheet rounded-full', large ? 'h-2' : 'h-1.5']">
      <div
        class="h-full rounded-full transition-all duration-500"
        :style="{ width: `${width}%`, backgroundColor: barColor }"
      />
    </div>
    <p v-if="description" class="text-xs text-questy-light/40 mt-0.5">
      {{ description }}
    </p>
  </div>
</template>
