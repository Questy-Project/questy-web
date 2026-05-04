<script setup lang="ts">
import type { Activity } from '~/types';

definePageMeta({ middleware: 'auth' });

const activitiesStore = useActivitiesStore();
const avatarStore = useAvatarStore();
const partsStore = usePartsStore();

const showSheet = ref(false);

const durations = [
  { label: '30min', value: 30 },
  { label: '1h', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2h+', value: 120 },
];

const intensities = [
  { label: 'Légère', value: 1, icon: 'directions_walk' },
  { label: 'Modérée', value: 1.5, icon: 'directions_run' },
  { label: 'Intense', value: 2, icon: 'local_fire_department' },
];

const selectedLabel = computed(() => {
  if (activitiesStore.selectedActivity) return activitiesStore.selectedActivity.name;
  if (activitiesStore.customName) return activitiesStore.customName;
  return null;
});

function onSelect(activity: Activity | null, custom: boolean) {
  if (!custom && activity) {
    activitiesStore.selectedActivity = activity;
    activitiesStore.customName = '';
    activitiesStore.customCategory = '';
  }
  showSheet.value = false;
}

async function submit() {
  await activitiesStore.logActivity();
  if (activitiesStore.success) {
    await Promise.all([avatarStore.fetchAvatar(), partsStore.fetchParts()]);
    setTimeout(() => {
      activitiesStore.reset();
      navigateTo('/dashboard');
    }, 2000);
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-questy-dark text-questy-light pb-20"
    style="font-family: 'Be Vietnam Pro', sans-serif"
  >
    <div class="max-w-lg mx-auto px-4 w-full space-y-5 pt-6">
      <!-- Header -->
      <header class="border-b border-questy-gold/20 pb-4">
        <h1
          class="text-3xl font-bold italic text-questy-gold"
          style="font-family: 'Newsreader', serif"
        >
          Mes Activités
        </h1>
        <p class="text-xs text-questy-light/50 uppercase tracking-widest mt-1">
          Déclare tes efforts, gagne de l'XP
        </p>
      </header>

      <!-- Succès -->
      <div
        v-if="activitiesStore.success"
        class="relative bg-questy-sheet/60 border border-questy-gold/40 backdrop-blur-sm p-5 text-center"
      >
        <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
        <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
        <p class="text-questy-gold font-semibold" style="font-family: 'Newsreader', serif">
          Activité enregistrée !
        </p>
        <p class="text-questy-light/70 text-sm mt-1">
          +{{ activitiesStore.lastLog?.xpGained }} XP · +{{ activitiesStore.lastLog?.partsUnlocked }} ❤️
        </p>
        <p class="text-questy-light/40 text-xs mt-2">Retour au dashboard...</p>
      </div>

      <template v-else>
        <!-- Activité -->
        <div class="space-y-2">
          <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Activité</p>
          <button
            class="w-full flex justify-between items-center bg-questy-sheet/60 border border-questy-gold/40 px-4 py-3 text-sm"
            @click="showSheet = true"
          >
            <span :class="selectedLabel ? 'text-questy-light' : 'text-questy-light/40'">
              {{ selectedLabel ?? 'Choisir une activité...' }}
            </span>
            <span class="text-questy-gold">▼</span>
          </button>
        </div>

        <!-- Durée -->
        <div class="space-y-2">
          <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Durée</p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="d in durations"
              :key="d.value"
              class="py-2 text-sm font-medium border transition-colors"
              :class="activitiesStore.duration === d.value
                ? 'bg-questy-gold/20 border-questy-gold text-questy-gold'
                : 'bg-questy-sheet/60 border-questy-gold/20 text-questy-light/60'"
              @click="activitiesStore.duration = d.value"
            >
              {{ d.label }}
            </button>
          </div>
        </div>

        <!-- Intensité -->
        <div class="space-y-2">
          <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Intensité</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="i in intensities"
              :key="i.value"
              class="py-3 border transition-colors text-center"
              :class="activitiesStore.intensity === i.value
                ? 'bg-questy-gold/20 border-questy-gold'
                : 'bg-questy-sheet/60 border-questy-gold/20'"
              @click="activitiesStore.intensity = i.value"
            >
              <span class="material-symbols-outlined text-questy-gold text-xl block">{{ i.icon }}</span>
              <div class="text-xs font-semibold mt-1">{{ i.label }}</div>
              <div class="text-[10px] text-questy-light/50">×{{ i.value }}</div>
            </button>
          </div>
        </div>

        <!-- Aperçu gains -->
        <div
          v-if="activitiesStore.duration && activitiesStore.intensity"
          class="relative bg-questy-sheet/60 border border-questy-gold/40 backdrop-blur-sm px-4 py-3"
        >
          <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
          <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
          <p class="text-xs font-bold text-questy-gold mb-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">bolt</span>
            Aperçu des gains
          </p>
          <div class="flex justify-between text-sm">
            <span class="text-questy-gold font-bold">+{{ activitiesStore.xpPreview }} XP</span>
            <span class="text-questy-light/60">+{{ activitiesStore.partsPreview }} ❤️</span>
          </div>
        </div>

        <!-- Erreur -->
        <p v-if="activitiesStore.error" class="text-red-400 text-sm text-center">
          {{ activitiesStore.error }}
        </p>

        <!-- CTA -->
        <button
          class="relative w-full overflow-hidden transition-all"
          :class="activitiesStore.canSubmit ? 'active:translate-y-0.5' : 'opacity-40 cursor-not-allowed'"
          :disabled="!activitiesStore.canSubmit || activitiesStore.loading"
          @click="submit"
        >
          <div class="absolute inset-0 bg-gradient-to-b from-questy-gold to-[#d4af37]" />
          <div class="relative px-6 py-4 flex items-center justify-center gap-2 border-b-4 border-[#554300]/40">
            <span class="font-bold text-[#3c2f00] uppercase tracking-widest text-sm">
              {{ activitiesStore.loading ? 'Enregistrement...' : '⚔ Valider l\'activité' }}
            </span>
          </div>
        </button>
      </template>
    </div>

    <ActivitySheet
      v-if="showSheet"
      @select="onSelect"
      @close="showSheet = false"
    />

    <UiBottomNav />
  </div>
</template>
