import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { TodayChallenge } from '~/types';

export const useChallengesStore = defineStore('challenges', () => {
  const todayChallenges = ref<TodayChallenge[]>([]);
  const loading = ref(false);
  const error   = ref<string | null>(null);

  async function fetchToday() {
    loading.value = true;
    error.value   = null;
    try {
      todayChallenges.value = await useApi<TodayChallenge[]>('/challenges/today');
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Impossible de charger les défis.';
    } finally {
      loading.value = false;
    }
  }

  return { todayChallenges, loading, error, fetchToday };
});
