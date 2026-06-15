import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { TournamentStatus, WeeklyRankEntry } from '~/types';

export const useTournamentStore = defineStore('tournament', () => {
  const status  = ref<TournamentStatus | null>(null);
  const ranking = ref<WeeklyRankEntry[]>([]);
  const loading = ref(false);
  const error   = ref<string | null>(null);

  async function fetchStatus() {
    loading.value = true;
    error.value   = null;
    try {
      status.value = await useApi<TournamentStatus>('/tournament/status');
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Impossible de charger le statut du tournoi.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchRanking() {
    ranking.value = await useApi<WeeklyRankEntry[]>('/tournament/ranking');
  }

  return { status, ranking, loading, error, fetchStatus, fetchRanking };
});
