import { defineStore } from 'pinia';
import type { MonthlyRankResponse } from '~/types';

const RANK_BORDER: Record<string, string> = {
  BRONZE: '#CD7F32',
  SILVER: '#939BAA',
  GOLD:   '#FFD700',
  LEGEND: '#FFB800',
};

export const useRankStore = defineStore('rank', () => {
  const rank    = ref<MonthlyRankResponse | null>(null);
  const loading = ref(false);

  const rankBorderColor = computed(() => RANK_BORDER[rank.value?.tier ?? ''] ?? 'rgba(201,168,76,0.4)');
  const isLegend        = computed(() => rank.value?.tier === 'LEGEND');

  async function fetchRank() {
    loading.value = true;
    try {
      rank.value = await useApi<MonthlyRankResponse>('/rank/me');
    } catch {
      rank.value = null;
    } finally {
      loading.value = false;
    }
  }

  return { rank, loading, rankBorderColor, isLegend, fetchRank };
});
