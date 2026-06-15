<script setup lang="ts">
defineProps<{ won: boolean; pointsGained: number; playerHp: number; opponentHp: number }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div class="flex flex-col items-center gap-4 text-center py-6">
    <span class="text-6xl">{{ won ? '🏆' : '💀' }}</span>
    <h2 class="text-2xl font-bold" :class="won ? 'text-questy-gold' : 'text-red-400'">
      {{ won ? 'Victoire !' : 'Défaite...' }}
    </h2>
    <p class="text-gray-300">
      HP restants — Toi : <strong>{{ playerHp }}</strong> / Adversaire : <strong>{{ opponentHp }}</strong>
    </p>
    <p class="text-questy-gold font-bold">+{{ pointsGained }} points de tournoi</p>
    <UiRpgButton color="#c9a84c" @click="emit('close')">🔙 Retour</UiRpgButton>
  </div>
</template>
