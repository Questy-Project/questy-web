import { defineStore } from 'pinia';
import type { Activity, ActivityLog } from '~/types';

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Activity[]>([]);
  const selectedActivity = ref<Activity | null>(null);
  const customName = ref('');
  const customCategory = ref('');
  const duration = ref<number | null>(null);
  const intensity = ref<number | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);
  const lastLog = ref<ActivityLog | null>(null);

  const xpPreview = computed(() => {
    if (!duration.value || !intensity.value) return 0;
    const multiplier = selectedActivity.value?.xpMultiplier ?? 1.0;
    return Math.round(duration.value * intensity.value * multiplier);
  });

  const partsPreview = computed(() => {
    if (!duration.value) return 0;
    return duration.value <= 30 ? 2 : duration.value <= 60 ? 4 : 6;
  });

  const canSubmit = computed(() => {
    const hasActivity = !!selectedActivity.value || customName.value.trim() !== '';
    return hasActivity && !!duration.value && !!intensity.value;
  });

  async function fetchActivities(search?: string) {
    loading.value = true;
    error.value = null;
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      activities.value = await useApi<Activity[]>(`/activities${params}`);
    } catch {
      error.value = 'Impossible de charger les activités.';
    } finally {
      loading.value = false;
    }
  }

  async function logActivity() {
    loading.value = true;
    error.value = null;
    success.value = false;
    try {
      const body: Record<string, unknown> = {
        duration: duration.value,
        intensity: intensity.value,
      };
      if (selectedActivity.value) {
        body.activityId = selectedActivity.value.id;
      } else {
        body.customName = customName.value;
        body.customCategory = customCategory.value;
      }
      lastLog.value = await useApi<ActivityLog>('/activities/log', {
        method: 'POST',
        body,
      });
      success.value = true;
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      error.value = err?.data?.message ?? 'Erreur lors de la déclaration.';
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    selectedActivity.value = null;
    customName.value = '';
    customCategory.value = '';
    duration.value = null;
    intensity.value = null;
    error.value = null;
    success.value = false;
    lastLog.value = null;
  }

  return {
    activities,
    selectedActivity,
    customName,
    customCategory,
    duration,
    intensity,
    loading,
    error,
    success,
    lastLog,
    xpPreview,
    partsPreview,
    canSubmit,
    fetchActivities,
    logActivity,
    reset,
  };
});
