<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const avatarStore = useAvatarStore();
const partsStore = usePartsStore();

const loading = computed(() => avatarStore.loading || partsStore.loading);
const error = computed(() => avatarStore.error || partsStore.error);

const avatar = computed(() => avatarStore.avatar);
const maxStat = computed(() => avatarStore.maxStat);

const xpPercent = computed(() => {
  if (!avatar.value) return 0;
  const { xp, xpNextLevel, level } = avatar.value;
  const xpCurrentLevel = (((level - 1) * level) / 2) * 100;
  const range = xpNextLevel - xpCurrentLevel;
  if (range <= 0) return 100;
  return Math.min(Math.round(((xp - xpCurrentLevel) / range) * 100), 100);
});

const authStore = useAuthStore();
const pseudo = computed(() => authStore.user?.pseudo ?? "");

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  await Promise.all([avatarStore.fetchAvatar(), partsStore.fetchParts()]);
});
</script>

<template>
  <div class="min-h-screen bg-questy-dark text-questy-light pb-20 flex flex-col justify-center">
    <!-- chargement -->
    <div v-if="loading" class="flex items-center justify-center flex-1">
      <span class="text-questy-violet animate-pulse">Chargement...</span>
    </div>

    <!-- erreur -->
    <div
      v-else-if="error"
      class="flex items-center justify-center flex-1 px-6"
    >
      <p class="text-red-400 text-center">{{ error }}</p>
    </div>

    <!-- dashboard -->
    <div v-else-if="avatar" class="max-w-lg mx-auto px-4 space-y-4 w-full">
      <!-- header : pseudo + cœurs -->
      <div class="flex items-center justify-between">
        <span class="text-lg font-bold text-questy-light">{{ pseudo }}</span>
        <PartsDisplay :stock="partsStore.stock" />
      </div>

      <!-- classe + niveau + barre XP -->
      <div class="flex items-center gap-3">
        <AvatarHeroClass :hero-class="avatar.heroClass" />
        <span class="text-xs text-questy-light/60"
          >Niv. {{ avatar.level }}</span
        >
        <div class="flex-1 bg-[#1a1245] rounded-full h-1.5">
          <div
            class="h-full rounded-full bg-questy-purple transition-all duration-500"
            :style="{ width: `${xpPercent}%` }"
          />
        </div>
        <span class="text-xs text-questy-light/60">{{ xpPercent }}%</span>
      </div>

      <!-- stats + avatar -->
      <div class="grid grid-cols-3 gap-3 items-center">
        <!-- stats gauche -->
        <div class="space-y-3">
          <AvatarStatBar
            label="Force"
            :value="avatar.strength"
            :max-value="maxStat"
          />
          <AvatarStatBar
            label="Agilité"
            :value="avatar.agility"
            :max-value="maxStat"
          />
          <AvatarStatBar
            label="Endurance"
            :value="avatar.endurance"
            :max-value="maxStat"
          />
        </div>

        <!-- avatar centré -->
        <div class="flex justify-center">
          <AvatarAvatar2D :hero-class="avatar.heroClass" />
        </div>

        <!-- stats droite -->
        <div class="space-y-3">
          <AvatarStatBar
            label="Intel."
            :value="avatar.intelligence"
            :max-value="maxStat"
            align="right"
          />
          <AvatarStatBar
            label="Esprit"
            :value="avatar.spirit"
            :max-value="maxStat"
            align="right"
          />
          <AvatarStatBar
            label="Vitalité"
            :value="avatar.vitality"
            :max-value="maxStat"
            align="right"
          />
        </div>
      </div>

      <!-- CTAs -->
      <div class="grid grid-cols-2 gap-3 pt-2">
        <button
          class="bg-questy-orange text-white font-semibold py-3 rounded-xl text-sm"
          @click="navigateTo('/activities')"
        >
          + Activité
        </button>
        <button
          class="bg-questy-purple text-white font-semibold py-3 rounded-xl text-sm"
          @click="navigateTo('/mini-games')"
        >
          Jouer
        </button>
      </div>
    </div>

    <UiBottomNav />
  </div>
</template>
