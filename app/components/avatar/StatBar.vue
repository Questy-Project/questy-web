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
      <span
        class="font-bold"
        :class="isRight ? 'text-questy-violet' : 'text-questy-orange'"
      >
        {{ value.toLocaleString("fr-FR") }}
      </span>
      <span v-if="isRight" class="text-questy-light/80">{{ label }}</span>
    </div>
    <div class="bg-[#1a1245] rounded-full h-1.5">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="isRight ? 'bg-questy-purple' : 'bg-questy-orange'"
        :style="{ width: `${width}%` }"
      />
    </div>
    <p v-if="description" class="text-xs text-questy-light/40 mt-0.5">
      {{ description }}
    </p>
  </div>
</template>
