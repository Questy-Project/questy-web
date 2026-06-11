<script setup lang="ts">
import type { TodayChallenge } from '~/types';

const props = defineProps<{ item: TodayChallenge; color: string }>();
const emit  = defineEmits<{ done: []; abandon: [] }>();

const total     = props.item.challenge.targetSeconds ?? 60;
const timeLeft  = ref(total);
const isRunning = ref(false);
let interval: ReturnType<typeof setInterval> | null = null;

const progress    = computed(() => ((total - timeLeft.value) / total) * 100);
const displayTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0');
  const s = (timeLeft.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});
const btnLabel = computed(() =>
  isRunning.value ? '⏳ Pause' : timeLeft.value === total ? '⚔️ Démarrer' : '▶️ Reprendre'
);

function toggle() {
  if (isRunning.value) {
    clearInterval(interval!);
    isRunning.value = false;
  } else {
    isRunning.value = true;
    interval = setInterval(() => {
      if (timeLeft.value <= 0) {
        clearInterval(interval!);
        isRunning.value = false;
        emit('done');
      } else {
        timeLeft.value--;
      }
    }, 1000);
  }
}

function abandon() {
  if (interval) clearInterval(interval);
  emit('abandon');
}

onUnmounted(() => { if (interval) clearInterval(interval); });
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-lg p-4 md:p-6" :style="{ background: '#1e1e2e', border: `1px solid ${color}33` }">
      <p class="text-xs md:text-sm text-questy-gold uppercase tracking-widest mb-2">Défi du jour</p>
      <p class="text-base md:text-xl font-bold text-white mb-1">{{ item.challenge.title }}</p>
      <p class="text-sm md:text-base text-gray-400 mb-4">{{ item.challenge.description }}</p>
      <p class="text-4xl md:text-6xl font-mono text-center font-bold mb-1" :style="{ color }">{{ displayTime }}</p>
      <p class="text-xs md:text-sm text-gray-500 text-center mb-3">Objectif : {{ total }}s</p>
      <div class="h-1.5 md:h-2 rounded-full bg-gray-700">
        <div
          class="h-full rounded-full transition-all duration-1000"
          :style="{ width: progress + '%', background: color }"
        />
      </div>
    </div>
    <div class="flex gap-3">
      <UiRpgButton :color="color" class="flex-1" @click="toggle">{{ btnLabel }}</UiRpgButton>
      <UiRpgButton variant="ghost" @click="abandon">🏳️ Abandonner</UiRpgButton>
    </div>
    <p class="text-xs md:text-sm text-center text-questy-light/60">Bonus ce mois : +{{ item.monthlyBonus }} · Plafond : +15</p>
  </div>
</template>
