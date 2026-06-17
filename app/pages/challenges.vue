<script setup lang="ts">
import type { TodayChallenge } from '~/types';
import { useChallengesStore } from '~/stores/challenges';
import { usePartsStore } from '~/stores/parts';

definePageMeta({ middleware: 'auth' });

const challengesStore = useChallengesStore();
const partsStore      = usePartsStore();
const { todayChallenges, loading, error } = storeToRefs(challengesStore);

const selected        = ref<TodayChallenge | null>(null);
const resultState     = ref<{ show: boolean; success: boolean } | null>(null);
const showSkipModal   = ref(false);
const currentSessionId = ref<string | null>(null);


const selectedMeta = computed(() =>
  selected.value ? (STAT_META[selected.value.challenge.stat] ?? STAT_META['STRENGTH']) : null
);

onMounted(() => challengesStore.fetchToday());

async function openChallenge(item: TodayChallenge) {
  if (item.challenge.type === 'OBJECTIVE' || item.challenge.type === 'TIMED') {
    try {
      await useApi(`/challenges/${item.challenge.id}/start`, { method: 'POST' });
      await partsStore.fetchParts();
    } catch (e: any) {
      await challengesStore.fetchToday();
      return;
    }
  }
  selected.value    = item;
  resultState.value = null;
}

function closeChallenge() {
  selected.value         = null;
  resultState.value      = null;
  currentSessionId.value = null;
}

function requestClose() {
  const type = selected.value?.challenge.type;
  const needsConfirm = type === 'OBJECTIVE' || type === 'TIMED' || !!currentSessionId.value;
  if (needsConfirm) { showSkipModal.value = true; } else { closeChallenge(); }
}

async function handleSkip() {
  if (!selected.value) return;
  showSkipModal.value = false;
  try {
    const type = selected.value.challenge.type;
    if (type === 'OBJECTIVE' || type === 'TIMED') {
      await useApi(`/challenges/${selected.value.challenge.id}/skip`, { method: 'POST' });
    } else if (currentSessionId.value) {
      await useApi('/challenges/ia/skip', { method: 'POST', body: { sessionId: currentSessionId.value } });
    }
  } catch { /* session introuvable ou déjà loggée */ }
  await challengesStore.fetchToday();
  closeChallenge();
}

async function handlePhysicalDone() {
  if (!selected.value) return;
  try {
    await useApi(`/challenges/${selected.value.challenge.id}/complete`, { method: 'POST' });
    resultState.value = { show: true, success: true };
  } catch {
    resultState.value = { show: true, success: false };
  }
  await Promise.all([challengesStore.fetchToday(), partsStore.fetchParts()]);
}

async function handleIAResult(success: boolean) {
  resultState.value = { show: true, success };
  await Promise.all([challengesStore.fetchToday(), partsStore.fetchParts()]);
}

async function handleAbandon(sessionId?: string | null) {
  if (!selected.value) return;
  try {
    const type = selected.value.challenge.type;
    if (type === 'OBJECTIVE' || type === 'TIMED') {
      await useApi(`/challenges/${selected.value.challenge.id}/abandon`, { method: 'POST' });
    } else if (sessionId) {
      await useApi('/challenges/ia/abandon', { method: 'POST', body: { sessionId } });
    }
  } catch { /* défi déjà loggé ou session introuvable — on ignore */ }
  resultState.value = { show: true, success: false };
  await Promise.all([challengesStore.fetchToday(), partsStore.fetchParts()]);
}
</script>

<template>
  <div
    class="min-h-screen text-white pb-24 lg:pb-4 flex flex-col bg-cover bg-center bg-no-repeat"
    style="background-image: linear-gradient(rgba(0,0,0,0.60), rgba(0,0,0,0.60)), url('/images/bg-challenge.png')"
  >
    <div class="w-full max-w-lg md:max-w-3xl mx-auto px-4 md:px-8 py-6 lg:py-2 flex-1 flex flex-col">

      <header class="mb-4 md:mb-8 lg:mb-2 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl lg:text-2xl font-bold italic text-questy-gold flex items-end gap-2" style="font-family: 'Newsreader', serif">
            <img src="/images/icons/icon-challenge.png" alt="" class="w-12 h-12 sm:w-14 sm:h-14 lg:w-9 lg:h-9 object-contain" />
            Défis du jour
          </h1>
          <p class="text-xs md:text-sm text-questy-light/50 mt-1">❤️ par défi · +1 stat · max 15/mois</p>
        </div>
        <div class="flex flex-col items-end flex-shrink-0 mt-1 gap-0.5">
          <span class="text-lg leading-none">❤️ {{ partsStore.stock }}<span class="text-questy-light/40">/12</span></span>
          <span class="text-xs text-questy-light/50">cœurs disponibles</span>
        </div>
      </header>

      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <span class="text-questy-gold/60 animate-pulse">Chargement...</span>
      </div>

      <div v-else-if="error" class="flex-1 flex items-center justify-center">
        <p class="text-red-400 text-center text-sm">{{ error }}</p>
      </div>

      <!-- Grille 2×3 mobile / 1×6 desktop -->
      <div v-else-if="!selected" class="flex-1 flex items-center justify-center">
        <ChallengeGrid :challenges="todayChallenges" @select="openChallenge" />
      </div>

      <!-- Vue détail -->
      <div v-else class="flex-1 flex flex-col items-center justify-center">
        <div class="w-full max-w-md md:max-w-2xl">

          <template v-if="!resultState?.show">
            <UiBackButton label="Retour aux défis" @click="requestClose" />
            <p class="text-xl md:text-3xl font-bold mb-4" style="font-family: 'Newsreader', serif" :style="{ color: selectedMeta?.color }">
              {{ selectedMeta?.label }}
            </p>

            <ChallengeObjective
              v-if="selected.challenge.type === 'OBJECTIVE'"
              :item="selected"
              :color="selectedMeta!.color"
              @done="handlePhysicalDone"
              @abandon="handleAbandon"
            />
            <ChallengeTimed
              v-else-if="selected.challenge.type === 'TIMED'"
              :item="selected"
              :color="selectedMeta!.color"
              @done="handlePhysicalDone"
              @abandon="handleAbandon"
            />
            <ChallengeIA
              v-else
              :item="selected"
              :color="selectedMeta!.color"
              @result="handleIAResult"
              @abandon="handleAbandon"
              @session-started="currentSessionId = $event"
            />
          </template>

          <!-- Résultat -->
          <ChallengeResult
            v-else
            :success="resultState.success"
            :stat-label="selectedMeta?.label ?? ''"
            :color="selectedMeta?.color ?? '#fff'"
            :monthly-bonus="selected.monthlyBonus + (resultState.success ? 1 : 0)"
            @close="closeChallenge"
          />
        </div>
      </div>

    </div>
  </div>

  <Teleport to="body">
    <div v-if="showSkipModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div class="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full text-center flex flex-col gap-4">
        <p class="text-lg font-bold text-white">Quitter ce défi ?</p>
        <p class="text-sm text-gray-400">Tu ne perdras pas de ❤️, mais ce défi sera <span class="text-questy-gold">bloqué pour aujourd'hui</span>.</p>
        <div class="flex gap-3">
          <button class="flex-1 py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600 transition" @click="showSkipModal = false">
            Continuer le défi
          </button>
          <button class="flex-1 py-2 rounded-lg bg-red-900 text-red-200 text-sm hover:bg-red-800 transition" @click="handleSkip">
            Quitter
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
