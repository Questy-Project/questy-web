<script setup lang="ts">
import { HERO_CLASS_COLOR_MAP } from "~/constants/heroClasses";

const props = defineProps<{ heroClass: string }>();

const color = computed(() => HERO_CLASS_COLOR_MAP[props.heroClass] ?? "#f2ca50");
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
