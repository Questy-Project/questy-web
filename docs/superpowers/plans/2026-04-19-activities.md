# US-08 — Page Déclaration d'Activité Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'utilisateur de déclarer une activité (catalogue ou libre), choisir durée et intensité, voir l'aperçu des gains XP/parties, et valider.

**Architecture:** Page unique scroll sur `pages/activities.vue` avec un store Pinia dédié. La sélection d'activité s'ouvre dans un bottom sheet (`components/activity/Sheet.vue`). Après validation, re-fetch avatar + parties puis redirect dashboard.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup lang="ts">`, Pinia, Tailwind CSS, `useApi()` composable

---

## Structure des fichiers

| Fichier | Action | Rôle |
|---------|--------|------|
| `app/types/index.ts` | Modifier | Ajouter interfaces `Activity` et `ActivityLog` |
| `app/stores/activities.ts` | Créer | État formulaire + appels API |
| `app/components/activity/Sheet.vue` | Créer | Bottom sheet recherche + filtres + liste |
| `app/pages/activities.vue` | Créer | Page principale déclaration |

> **Convention Nuxt 4 :** `components/activity/Sheet.vue` → `<ActivitySheet>` en template.

---

## Task 1 : Types Activity et ActivityLog

**Files:**
- Modify: `app/types/index.ts`

- [ ] **Step 1 : Ajouter les interfaces**

Ouvre `app/types/index.ts` et ajoute à la fin :

```typescript
export interface Activity {
  id: string;
  name: string;
  category: string;
  statPrimary: string;
  statSecondary: string | null;
  xpMultiplier: number;
}

export interface ActivityLog {
  id: string;
  duration: number;
  intensity: number;
  xpGained: number;
  partsUnlocked: number;
  loggedAt: string;
}
```

- [ ] **Step 2 : Vérifier**

Le fichier doit maintenant exporter : `User`, `AuthResponse`, `Avatar`, `AvatarResponse`, `Parts`, `Activity`, `ActivityLog`.

- [ ] **Step 3 : Commit**

```bash
git add app/types/index.ts
git commit -m "feat: types Activity et ActivityLog"
```

---

## Task 2 : Store activities.ts

**Files:**
- Create: `app/stores/activities.ts`

- [ ] **Step 1 : Créer le store**

Crée `app/stores/activities.ts` :

```typescript
import { defineStore } from 'pinia';
import type { Activity, ActivityLog } from '~/types';

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Activity[]>([]);
  const selectedActivity = ref<Activity | null>(null);
  const customName = ref('');
  const customCategory = ref('');
  const duration = ref<number | null>(null);
  const intensity = ref<number | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);
  const lastLog = ref<ActivityLog | null>(null);

  const xpPreview = computed(() => {
    if (!duration.value || !intensity.value) return 0;
    const multiplier = selectedActivity.value?.xpMultiplier ?? 1.0;
    return Math.round(duration.value * intensity.value * multiplier);
  });

  const partsPreview = computed(() => {
    if (!duration.value) return 0;
    return duration.value <= 30 ? 2 : duration.value <= 60 ? 4 : 6;
  });

  const canSubmit = computed(() => {
    const hasActivity = !!selectedActivity.value || customName.value.trim() !== '';
    return hasActivity && !!duration.value && !!intensity.value;
  });

  async function fetchActivities(search?: string) {
    loading.value = true;
    error.value = null;
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      activities.value = await useApi<Activity[]>(`/activities${params}`);
    } catch {
      error.value = 'Impossible de charger les activités.';
    } finally {
      loading.value = false;
    }
  }

  async function logActivity() {
    loading.value = true;
    error.value = null;
    success.value = false;
    try {
      const body: Record<string, unknown> = {
        duration: duration.value,
        intensity: intensity.value,
      };
      if (selectedActivity.value) {
        body.activityId = selectedActivity.value.id;
      } else {
        body.customName = customName.value;
        body.customCategory = customCategory.value;
      }
      lastLog.value = await useApi<ActivityLog>('/activities/log', {
        method: 'POST',
        body,
      });
      success.value = true;
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      error.value = err?.data?.message ?? 'Erreur lors de la déclaration.';
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    selectedActivity.value = null;
    customName.value = '';
    customCategory.value = '';
    duration.value = null;
    intensity.value = null;
    error.value = null;
    success.value = false;
    lastLog.value = null;
  }

  return {
    activities,
    selectedActivity,
    customName,
    customCategory,
    duration,
    intensity,
    loading,
    error,
    success,
    lastLog,
    xpPreview,
    partsPreview,
    canSubmit,
    fetchActivities,
    logActivity,
    reset,
  };
});
```

- [ ] **Step 2 : Vérifier dans le navigateur**

Lance `npm run dev`, ouvre la console — aucune erreur TypeScript.

- [ ] **Step 3 : Commit**

```bash
git add app/stores/activities.ts
git commit -m "feat: store activités — formulaire, aperçu gains, logActivity"
```

---

## Task 3 : ActivitySheet.vue — Bottom sheet

**Files:**
- Create: `app/components/activity/Sheet.vue`

> Nuxt 4 enregistre ce composant sous le nom `ActivitySheet`.

- [ ] **Step 1 : Créer le composant**

Crée `app/components/activity/Sheet.vue` :

```vue
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
  activitiesStore.customName = localCustomName.value;
  activitiesStore.customCategory = localCustomCategory.value;
  emit('select', null, true);
}
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/60 z-40" @click="$emit('close')" />

  <!-- Sheet -->
  <div class="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1245] rounded-t-2xl max-h-[80vh] flex flex-col">
    <!-- Handle -->
    <div class="flex justify-center pt-3 pb-2 flex-shrink-0">
      <div class="w-8 h-1 bg-questy-purple rounded-full" />
    </div>

    <!-- Recherche + filtres -->
    <div class="flex-shrink-0 px-4 pb-3">
      <div class="flex items-center gap-2 bg-questy-dark rounded-xl px-3 py-2 mb-3">
        <span class="text-questy-purple">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher une activité..."
          class="bg-transparent flex-1 text-sm text-questy-light placeholder-questy-violet/50 outline-none"
        />
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          v-for="cat in categories"
          :key="cat"
          class="flex-shrink-0 text-xs px-3 py-1 rounded-full border transition-colors"
          :class="selectedCategory === cat
            ? 'bg-questy-purple border-questy-purple text-white'
            : 'border-questy-purple/40 text-questy-violet'"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Liste -->
    <div class="overflow-y-auto flex-1 px-4 pb-6">
      <div v-if="activitiesStore.loading" class="text-center py-8 text-questy-violet text-sm animate-pulse">
        Chargement...
      </div>

      <template v-else>
        <button
          v-for="activity in filtered"
          :key="activity.id"
          class="w-full flex justify-between items-center py-3 border-b border-questy-dark text-sm transition-colors hover:bg-questy-purple/10"
          @click="selectActivity(activity)"
        >
          <span class="text-questy-light text-left">{{ activity.name }}</span>
          <span class="text-xs ml-2 flex-shrink-0" :class="statColor[activity.statPrimary] ?? 'text-questy-violet'">
            {{ statLabel[activity.statPrimary] ?? activity.statPrimary }}
          </span>
        </button>

        <!-- Autre -->
        <div class="mt-3">
          <button
            v-if="!showCustom"
            class="w-full border border-dashed border-questy-purple/50 rounded-xl py-3 text-sm text-questy-violet"
            @click="showCustom = true"
          >
            + Autre activité (saisie libre)
          </button>

          <div v-else class="space-y-2">
            <input
              v-model="localCustomName"
              type="text"
              placeholder="Nom de l'activité *"
              class="w-full bg-questy-dark rounded-xl px-3 py-2 text-sm text-questy-light placeholder-questy-violet/50 outline-none border border-questy-purple/30"
            />
            <input
              v-model="localCustomCategory"
              type="text"
              placeholder="Catégorie (optionnel)"
              class="w-full bg-questy-dark rounded-xl px-3 py-2 text-sm text-questy-light placeholder-questy-violet/50 outline-none border border-questy-purple/30"
            />
            <button
              class="w-full bg-questy-purple rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-40"
              :disabled="!localCustomName.trim()"
              @click="confirmCustom"
            >
              Confirmer
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
```

- [ ] **Step 2 : Commit**

```bash
git add app/components/activity/Sheet.vue
git commit -m "feat: ActivitySheet bottom sheet recherche et sélection activité"
```

---

## Task 4 : activities.vue — Page principale

**Files:**
- Create: `app/pages/activities.vue`

- [ ] **Step 1 : Créer la page**

Crée `app/pages/activities.vue` :

```vue
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
```

- [ ] **Step 2 : Tester manuellement**

1. Aller sur `/activities`
2. Cliquer "Choisir une activité" → bottom sheet s'ouvre ✓
3. Rechercher "football" → liste filtrée ✓
4. Sélectionner une activité → sheet se ferme, nom affiché ✓
5. Sélectionner durée 1h + intensité Modérée → aperçu gains apparaît ✓
6. Cliquer "Valider" → message succès + redirect dashboard ✓
7. Tester "Autre activité" → champs libres + confirmation ✓
8. Tester sans activité → bouton désactivé ✓

- [ ] **Step 3 : Commit**

```bash
git add app/pages/activities.vue
git commit -m "feat: page déclaration activité — durée, intensité, aperçu gains"
```

---

## Task 5 : Push + PR

- [ ] **Step 1 : Vérifier que tout est commité**

```bash
git status
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 2 : Push**

```bash
git push -u origin feature/activities
```

- [ ] **Step 3 : Créer la PR**

- **Base :** `develop`
- **Titre :** `feat: US-08 page déclaration d'activité`
- **Description :** `Closes #52, #53, #54, #55, #56, #57, #58, #59`
- **Labels :** `feature` + `frontend` + `must-have`
- **Milestone :** Milestone 2
