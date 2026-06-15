<script setup lang="ts">
import type { WeeklyRankEntry } from '~/types';
import { useAuthStore } from '~/stores/auth';

defineProps<{ ranking: WeeklyRankEntry[] }>();

const authStore = useAuthStore();
</script>

<template>
  <div class="mt-4">
    <h3 class="text-questy-gold font-bold mb-2 text-sm uppercase tracking-widest">Classement de la semaine</h3>
    <div v-if="ranking.length === 0" class="text-gray-500 text-sm text-center py-4">
      Aucun combat cette semaine.
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="(entry, i) in ranking"
        :key="entry.userId"
        class="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
        :class="entry.userId === authStore.user?.id ? 'bg-questy-gold/20 border border-questy-gold/40' : 'bg-gray-800/60'"
      >
        <span class="font-bold text-questy-gold w-6">{{ i + 1 }}</span>
        <span class="flex-1 text-gray-200">{{ entry.pseudo }}</span>
        <span class="text-gray-400 text-xs">{{ entry.wins }}V / {{ entry.losses }}D</span>
        <span class="font-bold text-questy-gold ml-3">{{ entry.totalPoints }} pts</span>
      </div>
    </div>
  </div>
</template>
