<script setup lang="ts">
import type { TodayChallenge } from '~/types';

const props = defineProps<{ item: TodayChallenge }>();
const emit  = defineEmits<{ select: [item: TodayChallenge] }>();


const meta = computed(() => STAT_META[props.item.challenge.stat] ?? STAT_META['STRENGTH']);

const isAvailable = computed(
  () => !props.item.alreadyDoneToday && !props.item.atCap && props.item.canAfford
);

const statusLabel = computed(() => {
  if (props.item.atCap)            return 'Plafond atteint';
  if (props.item.alreadyDoneToday) return 'Déjà relevé';
  if (!props.item.canAfford)       return 'Pas assez de ❤️';
  return `+${props.item.monthlyBonus}/15 ce mois`;
});
</script>

<template>
  <button
    :style="{ background: meta.bg, borderColor: meta.color }"
    class="border rounded-xl transition-opacity w-full
           p-4 flex flex-col items-center gap-2
           md:h-24 md:px-8 md:py-0 md:flex-row md:items-center md:gap-6"
    :class="isAvailable ? 'opacity-100 cursor-pointer hover:opacity-90' : 'opacity-40 cursor-not-allowed'"
    :disabled="!isAvailable"
    @click="isAvailable && emit('select', item)"
  >
    <!-- Icône stat -->
    <img :src="meta.icon" :alt="meta.label" class="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0" />

    <!-- Nom (mobile) / Nom + titre défi (desktop) -->
    <div class="flex flex-col items-center md:items-start md:flex-1 gap-0.5">
      <span class="text-xs md:text-sm font-bold" :style="{ color: meta.color }">{{ meta.label }}</span>
      <span class="hidden md:block text-xs text-questy-light/60 truncate max-w-xs">{{ item.challenge.title }}</span>
    </div>

    <!-- Coût + statut -->
    <div class="flex flex-col items-center md:items-end gap-0.5 md:flex-shrink-0">
      <span class="text-xs text-gray-400">❤️❤️❤️</span>
      <span class="text-xs" :class="isAvailable ? 'text-questy-gold' : 'text-gray-500'">
        {{ statusLabel }}
      </span>
    </div>
  </button>
</template>
