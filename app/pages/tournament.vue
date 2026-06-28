<script setup lang="ts">
import { useTournamentStore } from '~/stores/tournament';
import { useAuthStore } from '~/stores/auth';
import { useRankStore } from '~/stores/rank';
import type { CombatStart, MonthlyLeaderboardEntry, RankTier } from '~/types';

definePageMeta({ middleware: 'auth' });

const tournamentStore = useTournamentStore();
const authStore       = useAuthStore();
const rankStore       = useRankStore();
const { status, ranking, loading } = storeToRefs(tournamentStore);

const combatData          = ref<CombatStart | null>(null);
const startLoading        = ref(false);
const rankTab             = ref<'week' | 'month'>('week');
const monthlyLeaderboard  = ref<MonthlyLeaderboardEntry[]>([]);

const tierMap = computed<Record<string, RankTier>>(() =>
  Object.fromEntries(monthlyLeaderboard.value.map(e => [e.userId, e.tier]))
);

const myMonthlyRank = computed(() => {
  const idx = monthlyLeaderboard.value.findIndex(e => e.userId === authStore.user?.id);
  return idx === -1 ? null : idx + 1;
});

const RANK_ICON: Record<RankTier, string> = {
  BRONZE: '/images/rank-bronze.png',
  SILVER: '/images/rank-silver.png',
  GOLD:   '/images/rank-gold.png',
  LEGEND: '/images/rank-legend.png',
};

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  await tournamentStore.claimSlot();
  await Promise.all([tournamentStore.fetchStatus(), tournamentStore.fetchRanking(), rankStore.fetchRank()]);
  try {
    monthlyLeaderboard.value = await useApi<MonthlyLeaderboardEntry[]>('/rank/leaderboard');
  } catch { /* endpoint indisponible */ }
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
        <p class="text-xs text-questy-light/50 mt-1">1 combat/jour · 7 max/semaine · Victoire +30pts · Défaite +10pts</p>
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
            <p class="text-xs text-questy-light/60 uppercase tracking-widest">Rang mensuel</p>
            <RankBadge :tier="rankStore.rank.tier" :total-points="rankStore.rank.totalPoints" />
            <p class="text-sm text-questy-light/60 text-center leading-snug">
              Chaque combat rapporte des points · Victoire +30 · Défaite +10<br>
              Le rang est calculé en fin de mois selon ta position
            </p>
          </div>

          <!-- Statut joueur -->
          <div v-if="status" class="rounded-lg bg-gray-800/60 p-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p class="text-questy-gold font-bold text-lg">{{ status.wins }}</p>
              <p class="text-questy-light/60 text-xs">Victoires</p>
            </div>
            <div>
              <p class="text-red-400 font-bold text-lg">{{ status.losses }}</p>
              <p class="text-questy-light/60 text-xs">Défaites</p>
            </div>
            <div>
              <p class="text-questy-gold font-bold text-lg">{{ status.totalPoints }}</p>
              <p class="text-questy-light/60 text-xs">Points</p>
            </div>
          </div>

          <div v-if="status" class="rounded-lg border border-questy-gold/30 bg-questy-gold/5 px-4 py-3 text-center">
            <p class="text-questy-gold font-bold text-lg leading-none">
              ⚔️ {{ status.claimedSlots - status.combatsThisWeek }} combat{{ (status.claimedSlots - status.combatsThisWeek) > 1 ? 's' : '' }} disponible{{ (status.claimedSlots - status.combatsThisWeek) > 1 ? 's' : '' }}
            </p>
            <p class="text-xs text-questy-light/60 mt-1">
              {{ status.combatsThisWeek }} / {{ status.claimedSlots }} effectué{{ status.combatsThisWeek > 1 ? 's' : '' }} cette semaine
            </p>
          </div>

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

          <!-- Toggle classement semaine / mois -->
          <div class="mt-4">
            <div class="flex rounded-lg overflow-hidden border border-questy-gold/20 mb-3">
              <button
                class="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all"
                :class="rankTab === 'week' ? 'bg-questy-gold text-[#3c2f00]' : 'text-questy-light/60 hover:text-questy-light'"
                @click="rankTab = 'week'"
              >Semaine</button>
              <button
                class="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all"
                :class="rankTab === 'month' ? 'bg-questy-gold text-[#3c2f00]' : 'text-questy-light/60 hover:text-questy-light'"
                @click="rankTab = 'month'"
              >Mois</button>
            </div>

            <!-- Classement hebdomadaire -->
            <TournamentRanking v-if="rankTab === 'week'" :ranking="ranking" :tier-map="tierMap" />

            <!-- Classement mensuel -->
            <div v-else>
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-questy-gold font-bold text-sm uppercase tracking-widest">Classement du mois</h3>
                <span v-if="myMonthlyRank" class="text-xs text-questy-gold/60">
                  Ta position : <strong class="text-questy-gold">#{{ myMonthlyRank }}</strong>
                </span>
              </div>
              <div v-if="monthlyLeaderboard.length === 0" class="text-questy-light/50 text-sm text-center py-4">
                Aucun combat ce mois.
              </div>
              <div v-else class="space-y-1.5">
                <div
                  v-for="(entry, i) in monthlyLeaderboard"
                  :key="entry.userId"
                  class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  :class="entry.userId === authStore.user?.id
                    ? 'bg-questy-gold/20 border border-questy-gold/50'
                    : 'bg-gray-800/60'"
                >
                  <span class="font-bold w-6 shrink-0" :class="i < 3 ? 'text-questy-gold' : 'text-gray-500'">{{ i + 1 }}</span>
                  <img :src="RANK_ICON[entry.tier]" class="w-5 h-5 object-contain shrink-0" />
                  <span class="flex-1 truncate" :class="entry.userId === authStore.user?.id ? 'text-questy-gold font-bold' : 'text-gray-200'">
                    {{ entry.pseudo }}
                    <span v-if="entry.userId === authStore.user?.id" class="text-[10px] text-questy-gold/60 ml-1">← toi</span>
                  </span>
                  <span class="font-bold text-questy-gold shrink-0">{{ entry.totalPoints }} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>
