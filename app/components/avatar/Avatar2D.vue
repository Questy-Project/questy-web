<script setup lang="ts">
const props = defineProps<{ heroClass: string }>();

const colorMap: Record<string, string> = {
  Guerrier: "#8B0000",
  Voleur: "#EAB308",
  Tank: "#92400E",
  Mage: "#60A5FA",
  Prêtre: "#F1F5F9",
  Paladin: "#F472B6",
  Berserker: "#E05A00",
  "Mage de guerre": "#7A1C7A",
  Druide: "#7A9A5A",
  "Sage lettré": "#4A9FD4",
  Chevalier: "#A02818",
  Templier: "#D4A020",
  Champion: "#C02060",
  Rôdeur: "#C07010",
  Illusionniste: "#40A060",
  Moine: "#E8C840",
  "Danseur de lame": "#E87040",
  Alchimiste: "#306080",
  Colosse: "#A04050",
  Nécromant: "#9040D0",
  Chaman: "#E890C0",
  Aventurier: "#6B7280",
};

const color = computed(() => colorMap[props.heroClass] ?? "#6B7280");
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
