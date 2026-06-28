<script setup lang="ts">
import type { WeeklyRankEntry, RankTier } from '~/types';
import { useAuthStore } from '~/stores/auth';

const RANK_ICON: Record<RankTier, string> = {
  BRONZE: '/images/rank-bronze.png',
  SILVER: '/images/rank-silver.png',
  GOLD:   '/images/rank-gold.png',
  LEGEND: '/images/rank-legend.png',
};

const props  = defineProps<{
  ranking: WeeklyRankEntry[];
  tierMap?: Record<string, RankTier>;
}>();
const authStore = useAuthStore();

const PAGE_SIZE = 10;
const currentPage = ref(1);
const totalPages  = computed(() => Math.ceil(props.ranking.length / PAGE_SIZE));

const page = computed(() =>
  props.ranking.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
);

// Numéro de page contenant le joueur connecté
const myPage = computed(() => {
  const idx = props.ranking.findIndex(e => e.userId === authStore.user?.id);
  return idx === -1 ? null : Math.ceil((idx + 1) / PAGE_SIZE);
});

// Rang global du joueur connecté
const myRank = computed(() => {
  const idx = props.ranking.findIndex(e => e.userId === authStore.user?.id);
  return idx === -1 ? null : idx + 1;
});

// Au montage, ouvrir directement sur la page du joueur
onMounted(() => {
  if (myPage.value) currentPage.value = myPage.value;
});

function goTo(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
}
</script>

<template>
  <div class="mt-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-questy-gold font-bold text-sm uppercase tracking-widest">Classement de la semaine</h3>
      <span v-if="myRank" class="text-xs text-questy-gold/60">
        Ta position : <strong class="text-questy-gold">#{{ myRank }}</strong>
      </span>
    </div>

    <div v-if="ranking.length === 0" class="text-gray-500 text-sm text-center py-4">
      Aucun combat cette semaine.
    </div>

    <div v-else class="space-y-1.5">
      <div
        v-for="(entry, i) in page"
        :key="entry.userId"
        class="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
        :class="entry.userId === authStore.user?.id
          ? 'bg-questy-gold/20 border border-questy-gold/50'
          : 'bg-gray-800/60'"
      >
        <span
          class="font-bold w-6 shrink-0"
          :class="(currentPage - 1) * PAGE_SIZE + i + 1 <= 3 ? 'text-questy-gold' : 'text-gray-500'"
        >
          {{ (currentPage - 1) * PAGE_SIZE + i + 1 }}
        </span>
        <img
          v-if="tierMap?.[entry.userId]"
          :src="RANK_ICON[tierMap[entry.userId]]"
          class="w-5 h-5 object-contain shrink-0 mx-1"
        />
        <span class="flex-1 truncate" :class="entry.userId === authStore.user?.id ? 'text-questy-gold font-bold' : 'text-gray-200'">
          {{ entry.pseudo }}
          <span v-if="entry.userId === authStore.user?.id" class="text-[10px] text-questy-gold/60 ml-1">← toi</span>
        </span>
        <span class="text-gray-400 text-xs shrink-0">{{ entry.wins }}V / {{ entry.losses }}D</span>
        <span class="font-bold text-questy-gold ml-3 shrink-0">{{ entry.totalPoints }} pts</span>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-3">
      <button
        :disabled="currentPage === 1"
        class="px-3 py-1 text-xs rounded-lg bg-gray-800/60 text-gray-400 disabled:opacity-30 hover:bg-gray-700/60 transition"
        @click="goTo(currentPage - 1)"
      >
        ← Préc.
      </button>

      <div class="flex items-center gap-1">
        <!-- Bouton "Ma page" si on n'y est pas déjà -->
        <button
          v-if="myPage && myPage !== currentPage"
          class="px-2 py-1 text-[10px] rounded-lg bg-questy-gold/20 text-questy-gold border border-questy-gold/40 hover:bg-questy-gold/30 transition"
          @click="goTo(myPage)"
        >
          Me voir
        </button>
        <span class="text-xs text-gray-500">{{ currentPage }} / {{ totalPages }}</span>
      </div>

      <button
        :disabled="currentPage === totalPages"
        class="px-3 py-1 text-xs rounded-lg bg-gray-800/60 text-gray-400 disabled:opacity-30 hover:bg-gray-700/60 transition"
        @click="goTo(currentPage + 1)"
      >
        Suiv. →
      </button>
    </div>
  </div>
</template>
