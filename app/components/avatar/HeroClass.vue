<script setup lang="ts">
const props = defineProps<{ heroClass: string }>();

const colorMap: Record<string, string> = {
  Guerrier: '#8B0000',
  Voleur: '#EAB308',
  Tank: '#92400E',
  Mage: '#60A5FA',
  Prêtre: '#F1F5F9',
  Paladin: '#F472B6',
  Berserker: '#E05A00',
  'Mage de guerre': '#7A1C7A',
  Druide: '#7A9A5A',
  'Sage lettré': '#4A9FD4',
  Chevalier: '#A02818',
  Templier: '#D4A020',
  Champion: '#C02060',
  Rôdeur: '#C07010',
  Illusionniste: '#40A060',
  Moine: '#E8C840',
  'Danseur de lame': '#E87040',
  Alchimiste: '#306080',
  Colosse: '#A04050',
  Nécromant: '#9040D0',
  Chaman: '#E890C0',
  Aventurier: '#6B7280',
};

const color = computed(() => colorMap[props.heroClass] ?? '#6B7280');
</script>

<template>
  <span
    class="inline-block text-xs font-semibold px-3 py-1 rounded-full border"
    :style="{
      color: color,
      borderColor: color + '66',
      backgroundColor: color + '22',
    }"
  >
    {{ heroClass }}
  </span>
</template>
