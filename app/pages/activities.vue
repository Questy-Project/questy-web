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
  { label: 'Légère', value: 1, emoji: '🚶' },
  { label: 'Modérée', value: 1.5, emoji: '🏃' },
  { label: 'Intense', value: 2, emoji: '🔥' },
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
  <div class="min-h-screen bg-questy-dark text-questy-light pb-20 flex flex-col justify-center">
    <div class="max-w-lg mx-auto px-4 w-full space-y-5">
      <h1 class="text-lg font-bold">Déclarer une activité</h1>

      <!-- Succès -->
      <div
        v-if="activitiesStore.success"
        class="bg-green-900/30 border border-green-500/40 rounded-xl p-5 text-center"
      >
        <p class="text-green-400 font-semibold">Activité enregistrée !</p>
        <p class="text-questy-light/70 text-sm mt-1">
          +{{ activitiesStore.lastLog?.xpGained }} XP · +{{ activitiesStore.lastLog?.partsUnlocked }} ❤️
        </p>
        <p class="text-questy-violet/60 text-xs mt-2">Retour au dashboard...</p>
      </div>

      <template v-else>
        <!-- Activité -->
        <div>
          <p class="text-xs text-questy-violet mb-2">Activité</p>
          <button
            class="w-full flex justify-between items-center bg-[#1a1245] rounded-xl px-4 py-3 border border-questy-purple/40 text-sm"
            @click="showSheet = true"
          >
            <span :class="selectedLabel ? 'text-questy-light' : 'text-questy-violet/60'">
              {{ selectedLabel ?? 'Choisir une activité...' }}
            </span>
            <span class="text-questy-purple">▼</span>
          </button>
        </div>

        <!-- Durée -->
        <div>
          <p class="text-xs text-questy-violet mb-2">Durée</p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="d in durations"
              :key="d.value"
              class="py-2 rounded-xl text-sm font-medium border transition-colors"
              :class="activitiesStore.duration === d.value
                ? 'bg-questy-purple border-questy-purple text-white'
                : 'bg-[#1a1245] border-questy-purple/40 text-questy-violet'"
              @click="activitiesStore.duration = d.value"
            >
              {{ d.label }}
            </button>
          </div>
        </div>

        <!-- Intensité -->
        <div>
          <p class="text-xs text-questy-violet mb-2">Intensité</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="i in intensities"
              :key="i.value"
              class="py-3 rounded-xl border transition-colors text-center"
              :class="activitiesStore.intensity === i.value
                ? 'bg-questy-purple border-questy-purple'
                : 'bg-[#1a1245] border-questy-purple/40'"
              @click="activitiesStore.intensity = i.value"
            >
              <div class="text-xl">{{ i.emoji }}</div>
              <div class="text-xs font-semibold mt-1">{{ i.label }}</div>
              <div class="text-[10px] text-questy-light/60">×{{ i.value }}</div>
            </button>
          </div>
        </div>

        <!-- Aperçu gains -->
        <div
          v-if="activitiesStore.duration && activitiesStore.intensity"
          class="bg-[#1a1245] border border-questy-orange/50 rounded-xl px-4 py-3"
        >
          <p class="text-xs font-bold text-questy-orange mb-1">⚡ Aperçu des gains</p>
          <div class="flex justify-between text-sm">
            <span>+{{ activitiesStore.xpPreview }} XP</span>
            <span class="text-questy-violet">+{{ activitiesStore.partsPreview }} ❤️</span>
          </div>
        </div>

        <!-- Erreur -->
        <p v-if="activitiesStore.error" class="text-red-400 text-sm text-center">
          {{ activitiesStore.error }}
        </p>

        <!-- CTA -->
        <button
          class="w-full py-3 rounded-xl font-semibold text-sm transition-opacity"
          :class="activitiesStore.canSubmit
            ? 'bg-questy-orange text-white'
            : 'bg-questy-orange/30 text-white/40 cursor-not-allowed'"
          :disabled="!activitiesStore.canSubmit || activitiesStore.loading"
          @click="submit"
        >
          {{ activitiesStore.loading ? 'Enregistrement...' : '✓ Valider l\'activité' }}
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
