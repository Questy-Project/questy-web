<script setup lang="ts">
import { STAT_COLOR_MAP } from "~/constants/heroClasses";

definePageMeta({ middleware: "auth" });

const avatarStore = useAvatarStore();
const partsStore = usePartsStore();

const loading = computed(() => avatarStore.loading || partsStore.loading);
const error = computed(() => avatarStore.error || partsStore.error);

const avatar = computed(() => avatarStore.avatar);
const maxStat = computed(() => avatarStore.maxStat);
const xpPercent = computed(() => avatarStore.xpPercent);

const authStore = useAuthStore();

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  await Promise.all([avatarStore.fetchAvatar(), partsStore.fetchParts()]);
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
        <header class="flex items-start justify-between border-b border-questy-gold/20 pb-4">
          <div>
            <h1
              class="text-3xl sm:text-4xl font-bold italic text-questy-gold"
              style="font-family: 'Newsreader', serif"
            >
              Tableau de Bord
            </h1>
            <p class="text-xs sm:text-sm text-questy-light/50 uppercase tracking-widest mt-1">
              Ta progression RPG
            </p>
          </div>
          <PartsDisplay :stock="partsStore.stock" />
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
      </div>

      <!-- MILIEU : Portrait + Stats (occupe l'espace restant, centré) -->
      <div class="flex-1 flex flex-col justify-center py-6 sm:py-8">
        <div class="w-full sm:w-8/12 mx-auto px-4 sm:px-0">
        <div class="grid grid-cols-3 gap-4 sm:gap-6 items-center">
          <!-- Stats gauche -->
          <div class="space-y-4 sm:space-y-5">
            <AvatarStatBar large label="Force" :value="avatar.strength" :max-value="maxStat" :color="STAT_COLOR_MAP.strength" />
            <AvatarStatBar large label="Agilité" :value="avatar.agility" :max-value="maxStat" :color="STAT_COLOR_MAP.agility" />
            <AvatarStatBar large label="Endurance" :value="avatar.endurance" :max-value="maxStat" :color="STAT_COLOR_MAP.endurance" />
          </div>

          <!-- Portrait avatar encadré -->
          <div class="relative bg-questy-sheet/90 border border-questy-gold/40 p-4 sm:p-5 flex flex-col items-center gap-2">
            <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
            <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
            <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
            <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
            <div class="text-[9px] text-questy-gold/50 uppercase tracking-widest font-bold">Portrait</div>
            <div class="scale-125 sm:scale-150 my-2 sm:my-4">
              <AvatarAvatar2D :hero-class="avatar.heroClass" />
            </div>
          </div>

          <!-- Stats droite -->
          <div class="space-y-4 sm:space-y-5">
            <AvatarStatBar large label="Intel." :value="avatar.intelligence" :max-value="maxStat" align="right" :color="STAT_COLOR_MAP.intelligence" />
            <AvatarStatBar large label="Esprit" :value="avatar.spirit" :max-value="maxStat" align="right" :color="STAT_COLOR_MAP.spirit" />
            <AvatarStatBar large label="Vitalité" :value="avatar.vitality" :max-value="maxStat" align="right" :color="STAT_COLOR_MAP.vitality" />
          </div>
        </div>
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
        <button
          disabled
          title="Bientôt disponible"
          class="bg-questy-sheet/90 border border-questy-gold/20 text-questy-gold/30 font-bold py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-widest cursor-not-allowed"
        >
          Jouer
        </button>
      </div>
    </div>

    <UiBottomNav />
  </div>
</template>
