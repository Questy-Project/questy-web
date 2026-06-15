<script setup lang="ts">
import type { RankTier } from '~/types';

const props = defineProps<{
  tier: RankTier;
  totalPoints: number;
  size?: 'sm' | 'lg';
}>();

const size = computed(() => props.size ?? 'lg');

const RANK_META: Record<RankTier, { label: string; color: string; icon: string; pulse: boolean }> = {
  BRONZE: { label: 'Bronze',  color: '#CD7F32', icon: '/images/rank-bronze.png', pulse: false },
  SILVER: { label: 'Argent',  color: '#939BAA', icon: '/images/rank-silver.png', pulse: false },
  GOLD:   { label: 'Or',      color: '#FFD700', icon: '/images/rank-gold.png',   pulse: false },
  LEGEND: { label: 'Légende', color: '#FFB800', icon: '/images/rank-legend.png', pulse: true  },
};

const meta = computed(() => RANK_META[props.tier]);
</script>

<template>
  <!-- Mode sm : horizontal compact (ex: cadre profil) -->
  <div v-if="size === 'sm'" class="flex items-center gap-2">
    <img
      :src="meta.icon"
      :alt="meta.label"
      class="w-8 h-8 object-contain drop-shadow-lg shrink-0"
      :class="{ 'rank-legend-pulse': meta.pulse }"
    />
    <div>
      <p class="font-black text-sm leading-none" :style="{ color: meta.color }">{{ meta.label }}</p>
      <p class="text-[10px] text-gray-400 leading-none mt-0.5">{{ totalPoints }} pts</p>
    </div>
  </div>

  <!-- Mode lg : vertical centré (page tournoi) -->
  <div v-else class="flex flex-col items-center gap-1 py-2">
    <img
      :src="meta.icon"
      :alt="meta.label"
      class="w-48 h-48 object-contain drop-shadow-xl"
      :class="{ 'rank-legend-pulse': meta.pulse }"
    />
    <p
      class="font-black text-2xl leading-none mt-2"
      :style="{ color: meta.color, textShadow: meta.pulse ? `0 0 12px ${meta.color}99` : 'none' }"
    >
      {{ meta.label }}
    </p>
    <p class="text-xs text-gray-400 leading-none">{{ totalPoints }} pts ce mois</p>
  </div>
</template>

<style scoped>
@keyframes legend-pulse {
  0%, 100% { filter: drop-shadow(0 0 4px #FFB800AA); }
  50%       { filter: drop-shadow(0 0 14px #FFB800FF) drop-shadow(0 0 22px #FFB80066); }
}
.rank-legend-pulse {
  animation: legend-pulse 1.8s ease-in-out infinite;
}
</style>
