<script setup lang="ts">
import type { Activity } from '~/types';

const emit = defineEmits<{
  select: [activity: Activity | null, custom: boolean];
  close: [];
}>();

const activitiesStore = useActivitiesStore();

const search = ref('');
const selectedCategory = ref('Tout');
const showCustom = ref(false);
const localCustomName = ref('');
const localCustomCategory = ref('');
const customError = ref('');

const categories = [
  'Tout', 'Arts créatifs', 'Arts martiaux', 'Athlétisme', 'Bien-être',
  'Course', 'Cyclisme', 'Danse', 'Fitness', 'Gymnastique', 'Informatique',
  'Jeux de réflexion', 'Langues', 'Lecture', 'Musique', 'Natation',
  'Outdoor', 'Sports aériens', 'Sports collectifs', "Sports d'hiver",
  'Sports de raquette', 'Sports divers', 'Sports nautiques', 'Écriture',
];

const statColor: Record<string, string> = {
  STRENGTH: 'text-[#8B0000]',
  AGILITY: 'text-[#EAB308]',
  ENDURANCE: 'text-[#92400E]',
  INTELLIGENCE: 'text-[#60A5FA]',
  SPIRIT: 'text-[#F1F5F9]',
  VITALITY: 'text-[#F472B6]',
};

const statLabel: Record<string, string> = {
  STRENGTH: 'Force',
  AGILITY: 'Agilité',
  ENDURANCE: 'Endurance',
  INTELLIGENCE: 'Intel.',
  SPIRIT: 'Esprit',
  VITALITY: 'Vitalité',
};

const filtered = computed(() => {
  if (selectedCategory.value === 'Tout') return activitiesStore.activities;
  return activitiesStore.activities.filter(a => a.category === selectedCategory.value);
});

let debounceTimer: ReturnType<typeof setTimeout>;
watch(search, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    activitiesStore.fetchActivities(val || undefined);
  }, 300);
});

onMounted(() => {
  activitiesStore.fetchActivities();
});

function selectActivity(activity: Activity) {
  emit('select', activity, false);
}

function confirmCustom() {
  if (!localCustomName.value.trim()) return;
  const name = localCustomName.value.trim().toLowerCase();
  const exists = activitiesStore.activities.some(a => a.name.toLowerCase() === name);
  if (exists) {
    customError.value = 'Cette activité existe déjà dans le catalogue.';
    return;
  }
  customError.value = '';
  activitiesStore.customName = localCustomName.value;
  activitiesStore.customCategory = localCustomCategory.value;
  emit('select', null, true);
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/75 z-40" @click="$emit('close')" />

    <!-- Sheet -->
    <div class="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[82vh] flex flex-col bg-questy-sheet border-t border-questy-violet/25">

      <!-- Handle -->
      <div class="flex justify-center pt-4 pb-2 flex-shrink-0">
        <div class="w-10 h-1.5 rounded-full bg-questy-violet/50" />
      </div>

      <!-- Recherche + filtres -->
      <div class="flex-shrink-0 px-4 pb-3 space-y-2">
        <div class="flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-questy-purple/40 bg-questy-dark/70">
          <span class="text-questy-violet text-sm">🔍</span>
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher (ex: football...)"
            class="bg-transparent flex-1 text-sm text-questy-light placeholder-questy-violet/40 outline-none"
          />
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            v-for="cat in categories"
            :key="cat"
            class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
            :class="selectedCategory === cat
              ? 'bg-questy-purple border-questy-purple text-white'
              : 'border-questy-purple/30 text-questy-violet/70'"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="flex-shrink-0 mx-4 h-px bg-questy-purple/20" />

      <!-- Liste -->
      <div class="overflow-y-auto flex-1 min-h-0 px-4 pt-1">
        <div v-if="activitiesStore.loading" class="text-center py-10 text-questy-violet text-sm animate-pulse">
          Chargement...
        </div>

        <template v-else>
          <button
            v-for="activity in filtered"
            :key="activity.id"
            class="w-full flex justify-between items-center py-3.5 border-b border-questy-purple/15 text-sm transition-colors"
            @click="selectActivity(activity)"
          >
            <span class="text-questy-light text-left">{{ activity.name }}</span>
            <span
              class="text-xs ml-2 flex-shrink-0 font-semibold"
              :class="statColor[activity.statPrimary] ?? 'text-questy-violet'"
            >
              {{ statLabel[activity.statPrimary] ?? activity.statPrimary }}
            </span>
          </button>
        </template>
      </div>

      <!-- Footer fixe : Autre activité -->
      <div class="flex-shrink-0 px-4 py-3 border-t border-questy-purple/20">
        <button
          v-if="!showCustom"
          class="w-full border border-dashed border-questy-purple/40 rounded-2xl py-3 text-sm text-questy-violet/80 transition-colors"
          @click="showCustom = true"
        >
          + Autre activité (saisie libre)
        </button>

        <div v-else class="space-y-2">
          <p v-if="customError" class="text-red-400 text-xs px-1">{{ customError }}</p>
          <input
            v-model="localCustomName"
            type="text"
            placeholder="Nom de l'activité *"
            class="w-full rounded-2xl px-4 py-2.5 text-sm text-questy-light placeholder-questy-violet/40 outline-none border border-questy-purple/30 focus:border-questy-purple bg-questy-dark/70"
            @input="customError = ''"
          />
          <input
            v-model="localCustomCategory"
            type="text"
            placeholder="Catégorie (optionnel)"
            class="w-full rounded-2xl px-4 py-2.5 text-sm text-questy-light placeholder-questy-violet/40 outline-none border border-questy-purple/30 focus:border-questy-purple bg-questy-dark/70"
          />
          <div class="flex gap-2">
            <button
              class="flex-1 rounded-2xl py-2.5 text-sm text-questy-violet/70 border border-questy-purple/30"
              @click="showCustom = false; customError = ''"
            >
              Annuler
            </button>
            <button
              class="flex-1 bg-questy-purple rounded-2xl py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              :disabled="!localCustomName.trim()"
              @click="confirmCustom"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
