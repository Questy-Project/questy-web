<script setup lang="ts">
import { STAT_COLOR_MAP } from "~/constants/heroClasses";

definePageMeta({ middleware: "auth" });

const avatarStore = useAvatarStore();
const partsStore  = usePartsStore();
const rankStore   = useRankStore();

const loading = computed(() => avatarStore.loading || partsStore.loading);
const error   = computed(() => avatarStore.error   || partsStore.error);

const avatar   = computed(() => avatarStore.avatar);
const maxStat  = computed(() => avatarStore.maxStat);
const xpPercent = computed(() => avatarStore.xpPercent);

const authStore = useAuthStore();

const { rankBorderColor, isLegend } = storeToRefs(rankStore);

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  await Promise.all([avatarStore.fetchAvatar(), partsStore.fetchParts(), rankStore.fetchRank()]);
});
</script>

<template>
  <div
    class="min-h-screen bg-questy-dark text-questy-light pb-20 flex flex-col bg-cover bg-center bg-no-repeat"
    style="font-family: 'Be Vietnam Pro', sans-serif; background-image: linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.50)), url('/images/bg-tavern.jpg')"
  >
    <!-- Chargement -->
    <div v-if="loading" class="flex items-center justify-center flex-1">
      <span class="text-questy-gold/60 animate-pulse">Chargement...</span>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="flex items-center justify-center flex-1 px-6">
      <p class="text-red-400 text-center">{{ error }}</p>
    </div>

    <!-- Dashboard : 3 zones -->
    <div v-else-if="avatar" class="flex-1 flex flex-col w-full">

      <!-- HAUT : Header + XP -->
      <div class="max-w-xl mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-10 space-y-4">
        <header class="border-b border-questy-gold/20 pb-4">
          <h1
            class="text-2xl sm:text-3xl font-bold italic text-questy-gold text-center"
            style="font-family: 'Newsreader', serif"
          >
            Auberge
          </h1>
        </header>

        <!-- Classe + XP -->
        <div class="relative bg-questy-sheet/90 border border-questy-gold/40 p-4">
          <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
          <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
          <div class="flex items-center gap-3">
            <AvatarHeroClass :hero-class="avatar.heroClass" />
            <span class="text-xs text-questy-light/60">Niv. {{ avatar.level }}</span>
            <div class="flex-1 bg-questy-dark rounded-full h-1.5">
              <div
                class="h-full rounded-full bg-questy-purple transition-all duration-500"
                :style="{ width: `${xpPercent}%` }"
              />
            </div>
            <span class="text-xs text-questy-gold">{{ xpPercent }}%</span>
          </div>
        </div>

        <!-- Cœurs -->
        <PartsDisplay :stock="partsStore.stock" />
      </div>

      <!-- MILIEU : Portrait centré + Stats 2×3 -->
      <div class="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 px-4 sm:px-8 gap-6">

        <!-- Portrait avatar encadré (grand) -->
        <div
          class="relative bg-questy-sheet/90 p-4 flex flex-col items-center gap-2 transition-all duration-500"
          :class="{ 'rank-legend-glow': isLegend }"
          :style="{ border: `2px solid ${rankBorderColor}` }"
        >
          <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
          <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
          <div class="text-[9px] text-questy-gold/50 uppercase tracking-widest font-bold">{{ authStore.user?.pseudo }}</div>
          <div class="w-48 h-48 flex items-center justify-center">
            <div class="scale-[3]">
              <AvatarCanvas
                :silhouette="avatar.silhouette"
                :skin-tone="avatar.skinTone"
                :hair-style="avatar.hairStyle"
                :hair-color="avatar.hairColor"
                :hero-class="avatar.heroClass"
                :show-hood="avatar.showHood ?? false"
              />
            </div>
          </div>
        </div>

        <!-- Stats 2 colonnes × 3 lignes -->
        <div class="w-full max-w-xs sm:max-w-sm grid grid-cols-2 gap-3">
          <AvatarStatBar large label="Force"     :value="avatar.strength"     :max-value="100" :color="STAT_COLOR_MAP.strength" />
          <AvatarStatBar large label="Intel."    :value="avatar.intelligence" :max-value="100" :color="STAT_COLOR_MAP.intelligence" />
          <AvatarStatBar large label="Agilité"   :value="avatar.agility"      :max-value="100" :color="STAT_COLOR_MAP.agility" />
          <AvatarStatBar large label="Esprit"    :value="avatar.spirit"       :max-value="100" :color="STAT_COLOR_MAP.spirit" />
          <AvatarStatBar large label="Endurance" :value="avatar.endurance"    :max-value="100" :color="STAT_COLOR_MAP.endurance" />
          <AvatarStatBar large label="Vitalité"  :value="avatar.vitality"     :max-value="100" :color="STAT_COLOR_MAP.vitality" />
        </div>

      </div>

      <!-- BAS : CTAs -->
      <div class="max-w-xl mx-auto w-full px-4 sm:px-8 pb-6 sm:pb-10 grid grid-cols-2 gap-3 sm:gap-4">
        <button
          class="relative overflow-hidden active:translate-y-0.5 transition-transform"
          @click="navigateTo('/activities')"
        >
          <div class="absolute inset-0 bg-gradient-to-b from-questy-gold to-[#d4af37]" />
          <div class="relative px-4 py-3 sm:py-4 flex items-center justify-center gap-2 border-b-4 border-[#554300]/40">
            <span class="font-bold text-[#3c2f00] uppercase tracking-widest text-xs sm:text-sm">+ Activité</span>
          </div>
        </button>
        <NuxtLink
          to="/challenges"
          class="bg-questy-sheet/90 border border-questy-gold/20 text-questy-gold font-bold py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center"
        >
          ⚔️ Défis
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes legend-border-pulse {
  0%, 100% { box-shadow: 0 0 10px #FFB80055, 0 0 20px #FFB80022; }
  50%       { box-shadow: 0 0 20px #FFB800AA, 0 0 40px #FFB80044; }
}
.rank-legend-glow {
  animation: legend-border-pulse 1.8s ease-in-out infinite;
}
</style>
