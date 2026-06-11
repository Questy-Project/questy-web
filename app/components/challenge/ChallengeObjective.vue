<script setup lang="ts">
import type { TodayChallenge } from '~/types';

defineProps<{ item: TodayChallenge; color: string }>();
const emit = defineEmits<{ done: []; abandon: [] }>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-lg p-4 md:p-6" :style="{ background: '#1e1e2e', border: `1px solid ${color}33` }">
      <p class="text-xs md:text-sm text-questy-gold uppercase tracking-widest mb-2">Défi du jour</p>
      <p class="text-base md:text-xl font-bold text-white mb-1">{{ item.challenge.title }}</p>
      <p class="text-sm md:text-base text-gray-400">{{ item.challenge.description }}</p>
    </div>
    <p class="text-xs md:text-sm text-center text-gray-500">Fais le défi, puis reviens valider.</p>
    <div class="flex gap-3">
      <UiRpgButton :color="color" class="flex-1" @click="emit('done')">⚔️ Défi relevé !</UiRpgButton>
      <UiRpgButton variant="ghost" @click="emit('abandon')">🏳️ Abandonner</UiRpgButton>
    </div>
    <p class="text-xs md:text-sm text-center text-questy-light/60">Bonus ce mois : +{{ item.monthlyBonus }} · Plafond : +15</p>
  </div>
</template>
