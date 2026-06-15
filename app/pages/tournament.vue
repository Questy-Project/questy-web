<script setup lang="ts">
import { useTournamentStore } from '~/stores/tournament';
import type { CombatStart } from '~/types';

definePageMeta({ middleware: 'auth' });

const tournamentStore = useTournamentStore();
const { status, ranking, loading } = storeToRefs(tournamentStore);

const combatData   = ref<CombatStart | null>(null);
const resultState  = ref<{ show: boolean; won: boolean; pointsGained: number; playerHp: number; opponentHp: number } | null>(null);
const startLoading = ref(false);

onMounted(async () => {
  await tournamentStore.claimSlot(); // réclame le slot du jour avant le fetch du statut
  await Promise.all([tournamentStore.fetchStatus(), tournamentStore.fetchRanking()]);
  // Reprise d'un combat interrompu
  try {
    const current = await useApi<CombatStart | null>('/tournament/combat/current');
    if (current) combatData.value = current;
  } catch { /* aucun combat en cours */ }
});

async function startCombat() {
  startLoading.value = true;
  try {
    combatData.value  = await useApi<CombatStart>('/tournament/combat/start', { method: 'POST' });
    resultState.value = null;
  } catch (e: any) {
    alert(e?.data?.message ?? 'Impossible de démarrer le combat.');
  } finally {
    startLoading.value = false;
  }
}

async function handleResult(won: boolean, pointsGained: number, playerHp: number, opponentHp: number) {
  resultState.value = {
    show: true, won, pointsGained,
    playerHp,
    opponentHp,
  };
  await Promise.all([tournamentStore.fetchStatus(), tournamentStore.fetchRanking()]);
}

function closeResult() {
  combatData.value  = null;
  resultState.value = null;
}
</script>

<template>
  <div
    class="min-h-screen text-white pb-24 flex flex-col bg-cover bg-center bg-no-repeat"
    style="background-image: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/images/bg-challenge.png')"
  >
    <div class="w-full max-w-lg md:max-w-3xl mx-auto px-4 py-6 flex-1 flex flex-col">

      <header class="mb-6">
        <h1 class="text-xl md:text-3xl font-bold text-questy-gold" style="font-family: 'Newsreader', serif">
          ⚔️ Tournoi hebdomadaire
        </h1>
        <p class="text-xs text-questy-light/50 mt-1">1 combat par jour · 7 max par semaine · Victoire +30pts · Défaite +10pts</p>
      </header>

      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <span class="text-questy-gold/60 animate-pulse">Chargement...</span>
      </div>

      <template v-else>

        <!-- Vue combat en cours -->
        <template v-if="combatData && !resultState?.show">
          <p class="text-sm text-gray-400 mb-3">Adversaire : <strong class="text-white">{{ combatData.opponentPseudo }}</strong></p>
          <p v-if="combatData.turnsPlayed" class="text-xs text-questy-gold/60 mb-2">
            ↩️ Combat repris — tour {{ combatData.turnsPlayed + 1 }} / 10
          </p>
          <TournamentCombat :combat-data="combatData" @result="handleResult" />
        </template>

        <!-- Vue résultat -->
        <TournamentResult
          v-else-if="resultState?.show"
          :won="resultState.won"
          :points-gained="resultState.pointsGained"
          :player-hp="resultState.playerHp"
          :opponent-hp="resultState.opponentHp"
          @close="closeResult"
        />

        <!-- Vue principale -->
        <template v-else>
          <!-- Statut joueur -->
          <div v-if="status" class="rounded-lg bg-gray-800/60 p-4 mb-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p class="text-questy-gold font-bold text-lg">{{ status.wins }}</p>
              <p class="text-gray-400 text-xs">Victoires</p>
            </div>
            <div>
              <p class="text-red-400 font-bold text-lg">{{ status.losses }}</p>
              <p class="text-gray-400 text-xs">Défaites</p>
            </div>
            <div>
              <p class="text-questy-gold font-bold text-lg">{{ status.totalPoints }}</p>
              <p class="text-gray-400 text-xs">Points</p>
            </div>
          </div>

          <p v-if="status" class="text-xs text-center text-gray-500 mb-4">
            {{ status.claimedSlots - status.combatsThisWeek }} unité(s) disponible(s)
            · {{ status.combatsThisWeek }}/{{ status.claimedSlots }} effectué(s) cette semaine
          </p>

          <!-- Bouton combat -->
          <UiRpgButton
            color="#c9a84c"
            class="w-full mb-6"
            :disabled="!status?.canFightToday || startLoading"
            @click="startCombat"
          >
            {{ startLoading ? '⏳ Recherche d\'un adversaire...'
              : !status?.claimedSlots ? '🔒 Reviens demain pour gagner un combat'
              : status?.canFightToday ? '⚔️ Combattre'
              : '✅ Combat du jour effectué' }}
          </UiRpgButton>

          <!-- Classement -->
          <TournamentRanking :ranking="ranking" />
        </template>

      </template>
    </div>
  </div>
</template>
