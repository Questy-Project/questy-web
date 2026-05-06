<script setup lang="ts">
import { HERO_CLASS_COLOR_MAP } from "~/constants/heroClasses";

const props = defineProps<{ heroClass: string }>();

const color = computed(() => HERO_CLASS_COLOR_MAP[props.heroClass] ?? "#6B7280");
</script>

<template>
  <svg
    width="80"
    height="110"
    viewBox="0 0 80 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- tête -->
    <circle cx="40" cy="18" r="14" :fill="color" />
    <!-- corps -->
    <rect x="24" y="34" width="32" height="38" rx="6" :fill="color" />
    <!-- bras gauche -->
    <rect x="8" y="36" width="14" height="28" rx="5" :fill="color" />
    <!-- bras droit -->
    <rect x="58" y="36" width="14" height="28" rx="5" :fill="color" />
    <!-- jambe gauche -->
    <rect x="24" y="74" width="13" height="32" rx="5" :fill="color" />
    <!-- jambe droite -->
    <rect x="43" y="74" width="13" height="32" rx="5" :fill="color" />
  </svg>
</template>
