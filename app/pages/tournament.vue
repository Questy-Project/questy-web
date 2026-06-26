<script setup lang="ts">
import { useTournamentStore } from '~/stores/tournament';
import { useAuthStore } from '~/stores/auth';
import { useRankStore } from '~/stores/rank';
import type { CombatStart } from '~/types';

definePageMeta({ middleware: 'auth' });

const tournamentStore = useTournamentStore();
const authStore       = useAuthStore();
const rankStore       = useRankStore();
const { status, ranking, loading } = storeToRefs(tournamentStore);

const combatData   = ref<CombatStart | null>(null);
const startLoading = ref(false);

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  await tournamentStore.claimSlot();
  await Promise.all([tournamentStore.fetchStatus(), tournamentStore.fetchRanking(), rankStore.fetchRank()]);
  try {
    const current = await useApi<CombatStart | null>('/tournament/combat/current');
    if (current) combatData.value = current;
  } catch { /* aucun combat en cours */ }
});

async function startCombat() {
  startLoading.value = true;
  try {
    combatData.value = await useApi<CombatStart>('/tournament/combat/start', { method: 'POST' });
  } catch (e: any) {
    alert(e?.data?.message ?? 'Impossible de démarrer le combat.');
  } finally {
    startLoading.value = false;
  }
}

async function handleResult() {
  combatData.value = null; // retour à la vue principale
  await Promise.all([tournamentStore.fetchStatus(), tournamentStore.fetchRanking(), rankStore.fetchRank()]);
}
</script>

<template>
  <div
    class="min-h-screen text-white pb-24 flex flex-col bg-cover bg-center bg-no-repeat"
    style="background-image: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/images/bg-tournement.png')"
  >
    <div class="w-full max-w-lg md:max-w-3xl mx-auto px-4 flex-1 flex flex-col" :class="combatData ? 'py-2' : 'py-6'">

      <header v-if="!combatData" class="mb-6">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold italic text-questy-gold flex items-end gap-2" style="font-family: 'Newsreader', serif">
          <img src="/images/icons/icon-tournament.png" alt="" class="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain" />
          Tournoi hebdomadaire
        </h1>
        <p class="text-xs text-questy-light/50 mt-1">1 combat par jour · 7 max par semaine · Victoire +30pts · Défaite +10pts</p>
      </header>

      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <span class="text-questy-gold/60 animate-pulse">Chargement...</span>
      </div>

      <template v-else>

        <!-- Vue combat en cours — occupe tout l'espace vertical disponible -->
        <div v-if="combatData" class="flex-1 flex flex-col min-h-0">
          <p v-if="combatData.turnsPlayed" class="text-xs text-questy-gold/60 mb-2">
            ↩️ Combat repris — tour {{ combatData.turnsPlayed + 1 }} / 10
          </p>
          <TournamentCombat :combat-data="combatData" class="flex-1 min-h-0" @result="handleResult" />
        </div>

        <!-- Vue principale — centrée verticalement -->
        <div v-else class="flex-1 flex flex-col justify-center gap-4">

          <!-- Rang mensuel -->
          <div v-if="rankStore.rank" class="flex flex-col items-center gap-1">
            <p class="text-[10px] text-gray-500 uppercase tracking-widest">Rang mensuel</p>
            <RankBadge :tier="rankStore.rank.tier" :total-points="rankStore.rank.totalPoints" />
            <p class="text-[11px] text-gray-500 text-center leading-snug">
              Chaque combat rapporte des points · Victoire +30 · Défaite +10<br>
              Le rang est calculé en fin de mois selon ta position
            </p>
          </div>

          <!-- Statut joueur -->
          <div v-if="status" class="rounded-lg bg-gray-800/60 p-4 grid grid-cols-3 gap-2 text-center text-sm">
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

          <p v-if="status" class="text-xs text-center text-gray-500">
            {{ status.claimedSlots - status.combatsThisWeek }} unité(s) disponible(s)
            · {{ status.combatsThisWeek }}/{{ status.claimedSlots }} effectué(s) cette semaine
          </p>

          <!-- Bouton combat -->
          <UiRpgButton
            color="#c9a84c"
            class="w-full"
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
        </div>

      </template>
    </div>
  </div>
</template>
