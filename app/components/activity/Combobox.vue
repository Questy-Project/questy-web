<script setup lang="ts">
import type { Activity } from '~/types';

const emit = defineEmits<{
  select: [activity: Activity | null, custom: boolean];
}>();

const activitiesStore = useActivitiesStore();

const selectedCategory = ref('');
const query            = ref('');
const catOpen          = ref(false);
const actOpen          = ref(false);
const showCustom       = ref(false);
const localCustomName      = ref('');
const localCustomCategory  = ref('');
const customError      = ref('');
const catRoot          = ref<HTMLElement | null>(null);
const actRoot          = ref<HTMLElement | null>(null);
const actInputRef      = ref<HTMLInputElement | null>(null);

const CATEGORIES = [
  'Arts créatifs', 'Arts martiaux', 'Athlétisme', 'Bien-être',
  'Course', 'Cyclisme', 'Danse', 'Fitness', 'Gymnastique', 'Informatique',
  'Jeux de réflexion', 'Langues', 'Lecture', 'Musique', 'Natation',
  'Outdoor', 'Sports aériens', 'Sports collectifs', "Sports d'hiver",
  'Sports de raquette', 'Sports divers', 'Sports nautiques', 'Écriture',
];

const filteredActivities = computed(() => {
  const q   = query.value.trim().toLowerCase();
  const cat = selectedCategory.value;
  // Sans catégorie et sans saisie : aucune proposition
  if (!cat && !q) return [];
  let list = activitiesStore.activities;
  if (cat) list = list.filter(a => a.category === cat);
  if (q)   list = list.filter(a => a.name.toLowerCase().includes(q));
  return list.slice(0, 10);
});

const selectedLabel = computed(() => {
  if (activitiesStore.selectedActivity) return activitiesStore.selectedActivity.name;
  if (activitiesStore.customName)       return activitiesStore.customName;
  return '';
});

onMounted(() => activitiesStore.fetchActivities());

function selectCategory(cat: string) {
  selectedCategory.value = cat;
  catOpen.value = false;
  // Réinitialise la sélection d'activité si la catégorie change
  activitiesStore.selectedActivity = null;
  activitiesStore.customName = '';
  query.value = '';
  showCustom.value = false;
  actInputRef.value?.focus();
  actOpen.value = true;
}

function clearCategory() {
  selectedCategory.value = '';
  activitiesStore.selectedActivity = null;
  activitiesStore.customName = '';
  query.value = '';
  showCustom.value = false;
}

function selectActivity(activity: Activity) {
  query.value   = '';
  actOpen.value = false;
  showCustom.value = false;
  emit('select', activity, false);
}

function clearActivity() {
  query.value = '';
  activitiesStore.selectedActivity = null;
  activitiesStore.customName = '';
  actOpen.value = true;
  actInputRef.value?.focus();
}

function startCustom() {
  actOpen.value    = false;
  showCustom.value = true;
}

function confirmCustom() {
  if (!localCustomName.value.trim()) return;
  const name   = localCustomName.value.trim().toLowerCase();
  const exists = activitiesStore.activities.some(a => a.name.toLowerCase() === name);
  if (exists) { customError.value = 'Cette activité existe déjà dans le catalogue.'; return; }
  customError.value              = '';
  activitiesStore.customName     = localCustomName.value;
  activitiesStore.customCategory = localCustomCategory.value || selectedCategory.value;
  showCustom.value               = false;
  emit('select', null, true);
}

function cancelCustom() {
  showCustom.value          = false;
  localCustomName.value     = '';
  localCustomCategory.value = '';
  customError.value         = '';
}

function handleMousedown(e: MouseEvent) {
  if (catRoot.value && !catRoot.value.contains(e.target as Node)) catOpen.value = false;
  if (actRoot.value && !actRoot.value.contains(e.target as Node)) actOpen.value = false;
}
onMounted(() => document.addEventListener('mousedown', handleMousedown));
onUnmounted(() => document.removeEventListener('mousedown', handleMousedown));
</script>

<template>
  <div class="space-y-4">

    <!-- Champ 1 : Catégorie -->
    <div class="space-y-2">
      <p class="text-xs lg:text-sm text-questy-gold/70 uppercase tracking-widest font-bold">Catégorie</p>
      <div ref="catRoot" class="relative">
        <button
          type="button"
          class="w-full flex justify-between items-center bg-questy-dark/60 border px-4 py-3 lg:py-4 text-sm lg:text-base transition-colors"
          :class="catOpen ? 'border-questy-gold' : 'border-questy-gold/40'"
          @click="catOpen = !catOpen"
        >
          <span :class="selectedCategory ? 'text-questy-light' : 'text-questy-light/40'">
            {{ selectedCategory || 'Choisir une catégorie…' }}
          </span>
          <div class="flex items-center gap-2">
            <span
              v-if="selectedCategory"
              class="text-questy-light/40 text-xs hover:text-questy-light/70"
              @click.stop="clearCategory"
            >✕</span>
            <span class="text-questy-gold/60 text-xs">▼</span>
          </div>
        </button>

        <div
          v-if="catOpen"
          class="absolute top-full left-0 right-0 z-50 mt-1 bg-questy-sheet border border-questy-gold/30 shadow-xl max-h-56 overflow-y-auto"
        >
          <button
            v-for="cat in CATEGORIES"
            :key="cat"
            class="w-full px-4 py-3 text-sm text-left border-b border-questy-gold/10 hover:bg-questy-gold/10 transition-colors"
            :class="selectedCategory === cat ? 'text-questy-gold font-semibold' : 'text-questy-light'"
            @mousedown.prevent="selectCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>

    <!-- Champ 2 : Activité -->
    <div class="space-y-2">
      <p class="text-xs lg:text-sm text-questy-gold/70 uppercase tracking-widest font-bold">Activité</p>
      <div ref="actRoot" class="relative">

        <!-- Activité déjà sélectionnée -->
        <div
          v-if="selectedLabel && !actOpen"
          class="w-full flex justify-between items-center bg-questy-dark/60 border border-questy-gold/40 px-4 py-3 lg:py-4 text-sm lg:text-base cursor-pointer"
          @click="clearActivity"
        >
          <span class="text-questy-light truncate">{{ selectedLabel }}</span>
          <span class="text-questy-light/40 text-xs hover:text-questy-light/70 shrink-0 ml-2">✕</span>
        </div>

        <!-- Champ de recherche -->
        <div
          v-else
          class="w-full flex items-center gap-3 bg-questy-dark/60 border px-4 py-3 lg:py-4 transition-colors cursor-text"
          :class="actOpen ? 'border-questy-gold' : 'border-questy-gold/40'"
          @click="actInputRef?.focus(); actOpen = true"
        >
          <span class="text-questy-gold/60 text-sm shrink-0">🔍</span>
          <input
            ref="actInputRef"
            v-model="query"
            type="text"
            :placeholder="selectedCategory ? `Rechercher en « ${selectedCategory} »…` : 'Rechercher une activité…'"
            class="flex-1 bg-transparent text-sm lg:text-base text-questy-light placeholder:text-questy-light/40 outline-none"
            @focus="actOpen = true"
            @input="actOpen = true"
          />
        </div>

        <!-- Dropdown activités -->
        <div
          v-if="actOpen && !showCustom"
          class="absolute top-full left-0 right-0 z-50 mt-1 bg-questy-sheet border border-questy-gold/30 shadow-xl"
        >
          <div v-if="activitiesStore.loading" class="py-4 text-center text-questy-light/40 text-sm animate-pulse">
            Chargement...
          </div>
          <template v-else>
            <div class="max-h-52 overflow-y-auto">
              <button
                v-for="activity in filteredActivities"
                :key="activity.id"
                class="w-full flex justify-between items-center px-4 py-3 text-sm border-b border-questy-gold/10 hover:bg-questy-gold/10 transition-colors text-left"
                @mousedown.prevent="selectActivity(activity)"
              >
                <span class="text-questy-light">{{ activity.name }}</span>
                <span
                  class="text-xs font-semibold shrink-0 ml-3"
                  :style="{ color: STAT_META[activity.statPrimary]?.color ?? '#f2ca50' }"
                >
                  {{ STAT_META[activity.statPrimary]?.label ?? activity.statPrimary }}
                </span>
              </button>
              <div v-if="filteredActivities.length === 0" class="px-4 py-3 text-sm text-questy-light/40 italic">
                {{ !selectedCategory && !query ? 'Tape au moins une lettre pour voir des suggestions…' : 'Aucun résultat' }}
              </div>
            </div>
            <button
              class="w-full px-4 py-3 text-sm text-questy-gold/70 hover:bg-questy-gold/10 border-t border-questy-gold/20 text-left transition-colors"
              @mousedown.prevent="startCustom"
            >
              + Autre activité (saisie libre)
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Saisie personnalisée -->
    <div v-if="showCustom" class="space-y-2">
      <p v-if="customError" class="text-red-400 text-xs">{{ customError }}</p>
      <input
        v-model="localCustomName"
        type="text"
        placeholder="Nom de l'activité *"
        class="w-full bg-questy-dark/60 border border-questy-gold/40 px-4 py-3 text-sm text-questy-light placeholder:text-questy-light/30 focus:outline-none focus:border-questy-gold"
        @input="customError = ''"
      />
      <input
        v-model="localCustomCategory"
        type="text"
        placeholder="Catégorie (optionnel)"
        class="w-full bg-questy-dark/60 border border-questy-gold/40 px-4 py-3 text-sm text-questy-light placeholder:text-questy-light/30 focus:outline-none focus:border-questy-gold"
      />
      <div class="flex gap-2">
        <button
          class="flex-1 py-2.5 text-sm text-questy-light/60 border border-questy-gold/20 hover:border-questy-gold/40 transition-colors"
          @click="cancelCustom"
        >
          Annuler
        </button>
        <button
          class="flex-1 py-2.5 text-sm font-semibold bg-questy-gold/20 border border-questy-gold/50 text-questy-gold hover:bg-questy-gold/30 transition-colors disabled:opacity-40"
          :disabled="!localCustomName.trim()"
          @click="confirmCustom"
        >
          Confirmer
        </button>
      </div>
    </div>

  </div>
</template>
