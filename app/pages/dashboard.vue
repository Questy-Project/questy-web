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
      <div class="w-full px-4 sm:px-8 lg:px-16 pt-6 sm:pt-8 lg:pt-3 space-y-4 lg:space-y-2 max-w-5xl lg:max-w-none">
        <header class="border-b border-questy-gold/20 pb-4 lg:pb-2">
          <h1
            class="text-3xl sm:text-4xl lg:text-2xl font-bold italic text-questy-gold flex items-end gap-2"
            style="font-family: 'Newsreader', serif"
          >
            <img src="/images/icons/icon-acceuil.png" alt="" class="w-12 h-12 sm:w-14 sm:h-14 lg:w-9 lg:h-9 object-contain" />
            Auberge
          </h1>
        </header>

        <!-- Classe + XP -->
        <div class="relative bg-questy-sheet/90 border border-questy-gold/40 p-3 lg:p-4">
          <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
          <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
          <div class="flex items-center gap-3">
            <AvatarHeroClass :hero-class="avatar.heroClass" />
            <span class="text-xs lg:text-sm text-questy-light/60">Niv. {{ avatar.level }}</span>
            <div class="flex-1 relative bg-questy-dark rounded-full h-2 lg:h-2.5 overflow-hidden" style="box-shadow: inset 0 1px 3px rgba(0,0,0,0.6);">
              <div
                class="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                :style="{ width: `${xpPercent}%`, background: 'linear-gradient(90deg, #7c3aed99, #7c3aed)' }"
              >
                <div class="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-full" />
              </div>
            </div>
            <span class="text-xs lg:text-sm text-questy-gold font-bold">{{ xpPercent }}%</span>
          </div>
        </div>

        <!-- Cœurs -->
        <PartsDisplay :stock="partsStore.stock" />
      </div>

      <!-- MILIEU : Layout 3 colonnes desktop / portrait + stats mobile -->
      <div class="flex-1 flex flex-col lg:flex-row items-center justify-center py-6 sm:py-8 lg:py-3 px-4 sm:px-8 lg:px-16 gap-6 lg:gap-6 xl:gap-10">

        <!-- Stats gauche (Force, Agilité, Endurance) — desktop uniquement -->
        <div class="hidden lg:flex flex-col justify-center gap-6 lg:gap-3 xl:gap-8 w-56 lg:w-44 xl:w-72 shrink-0">
          <AvatarStatBar large align="right" label="Force"     :value="avatar.strength"  :max-value="100" :color="STAT_COLOR_MAP.strength" />
          <AvatarStatBar large align="right" label="Agilité"   :value="avatar.agility"   :max-value="100" :color="STAT_COLOR_MAP.agility" />
          <AvatarStatBar large align="right" label="Endurance" :value="avatar.endurance" :max-value="100" :color="STAT_COLOR_MAP.endurance" />
        </div>

        <!-- Portrait avatar encadré -->
        <div
          class="relative bg-questy-sheet/90 p-4 flex flex-col items-center gap-2 transition-all duration-500 shrink-0"
          :class="{ 'rank-legend-glow': isLegend }"
          :style="{ border: `2px solid ${rankBorderColor}` }"
        >
          <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
          <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
          <div class="text-[9px] lg:text-[11px] text-questy-gold/50 uppercase tracking-widest font-bold">{{ authStore.user?.pseudo }}</div>
          <div class="w-48 h-48 lg:w-40 lg:h-40 xl:w-48 xl:h-48 flex items-center justify-center">
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

        <!-- Stats droite (Intelligence, Esprit, Vitalité) — desktop uniquement -->
        <div class="hidden lg:flex flex-col justify-center gap-6 lg:gap-3 xl:gap-8 w-56 lg:w-44 xl:w-72 shrink-0">
          <AvatarStatBar large label="Intelligence" :value="avatar.intelligence" :max-value="100" :color="STAT_COLOR_MAP.intelligence" />
          <AvatarStatBar large label="Esprit"       :value="avatar.spirit"       :max-value="100" :color="STAT_COLOR_MAP.spirit" />
          <AvatarStatBar large label="Vitalité"     :value="avatar.vitality"     :max-value="100" :color="STAT_COLOR_MAP.vitality" />
        </div>

        <!-- Stats mobile — grille 2 colonnes sous le portrait -->
        <div class="lg:hidden w-full max-w-xs sm:max-w-sm grid grid-cols-2 gap-3">
          <AvatarStatBar large label="Force"     :value="avatar.strength"     :max-value="100" :color="STAT_COLOR_MAP.strength" />
          <AvatarStatBar large label="Intel."    :value="avatar.intelligence" :max-value="100" :color="STAT_COLOR_MAP.intelligence" />
          <AvatarStatBar large label="Agilité"   :value="avatar.agility"      :max-value="100" :color="STAT_COLOR_MAP.agility" />
          <AvatarStatBar large label="Esprit"    :value="avatar.spirit"       :max-value="100" :color="STAT_COLOR_MAP.spirit" />
          <AvatarStatBar large label="Endurance" :value="avatar.endurance"    :max-value="100" :color="STAT_COLOR_MAP.endurance" />
          <AvatarStatBar large label="Vitalité"  :value="avatar.vitality"     :max-value="100" :color="STAT_COLOR_MAP.vitality" />
        </div>

      </div>

      <!-- BAS : CTAs -->
      <div class="w-full px-4 sm:px-8 lg:px-16 pb-6 sm:pb-10 lg:pb-3 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-3">
        <button
          class="relative overflow-hidden active:translate-y-0.5 transition-transform"
          @click="navigateTo('/activities')"
        >
          <div class="absolute inset-0 bg-gradient-to-b from-questy-gold to-[#d4af37]" />
          <div class="relative px-4 py-3 sm:py-4 lg:py-2 flex items-center justify-center gap-2 lg:gap-3 border-b-4 border-[#554300]/40">
            <img src="/images/icons/icon-activities.png" alt="Activités" class="w-6 h-6 lg:w-8 lg:h-8 object-contain" />
            <span class="font-bold text-[#3c2f00] uppercase tracking-widest text-xs sm:text-sm lg:text-base">Activité</span>
          </div>
        </button>
        <button
          class="relative overflow-hidden active:translate-y-0.5 transition-transform"
          @click="navigateTo('/challenges')"
        >
          <div class="absolute inset-0 bg-gradient-to-b from-[#7c3aed] to-[#6d28d9]" />
          <div class="relative px-4 py-3 sm:py-4 lg:py-2 flex items-center justify-center gap-2 lg:gap-3 border-b-4 border-[#3b1285]/60">
            <img src="/images/icons/icon-challenge.png" alt="Défis" class="w-6 h-6 lg:w-8 lg:h-8 object-contain" />
            <span class="font-bold text-white uppercase tracking-widest text-xs sm:text-sm lg:text-base">Défis</span>
          </div>
        </button>
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
