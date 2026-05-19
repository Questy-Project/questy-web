# US-09 Dashboard personnage RPG — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter le dashboard personnage RPG : avatar SVG, 6 statistiques, classe du héros, niveau/XP, stock de parties en cœurs, navbar fixe.

**Architecture:** 5 composants réutilisables (Avatar2D, StatBar, HeroClass, PartsDisplay, BottomNav) alimentés par 2 stores Pinia (avatar, parts) appelant le backend NestJS. Le dashboard assemble le tout avec Promise.all au montage.

**Tech Stack:** Nuxt 3, Vue 3 (Composition API), Pinia, Tailwind CSS, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-19-dashboard-design.md`

---

## Fichiers concernés

| Action | Fichier |
|--------|---------|
| Modifier | `app/types/index.ts` |
| Créer | `app/stores/avatar.ts` |
| Créer | `app/stores/parts.ts` |
| Créer | `app/components/ui/BottomNav.vue` |
| Créer | `app/components/avatar/StatBar.vue` |
| Créer | `app/components/avatar/HeroClass.vue` |
| Créer | `app/components/avatar/Avatar2D.vue` |
| Créer | `app/components/parts/PartsDisplay.vue` |
| Réécrire | `app/pages/dashboard.vue` |
| Modifier | `.gitignore` |

---

## Task 0 — Nettoyage .gitignore

**Fichiers :** Modifier `.gitignore` à la racine de `questy-web`

- [ ] Ajouter `.superpowers/` à `.gitignore` :

```
.superpowers/
```

- [ ] Commit :

```bash
git add .gitignore
git commit -m "chore: ignorer le dossier .superpowers du visual companion"
```

---

## Task 1 — Types TypeScript

**Fichiers :** Modifier `app/types/index.ts`

- [ ] Ajouter les 3 interfaces à la fin du fichier :

```typescript
export interface Avatar {
  id: string
  level: number
  xp: number
  heroClass: string
  strength: number
  agility: number
  endurance: number
  intelligence: number
  spirit: number
  vitality: number
}

export interface AvatarResponse extends Avatar {
  xpNextLevel: number
}

export interface Parts {
  stock: number
}
```

- [ ] Vérifier que TypeScript ne signale aucune erreur (`npx nuxi typecheck` ou vérifier dans l'IDE).

- [ ] Commit :

```bash
git add app/types/index.ts
git commit -m "feat: interfaces TypeScript Avatar, AvatarResponse, Parts"
```

---

## Task 2 — Store Pinia avatar

**Fichiers :** Créer `app/stores/avatar.ts`

- [ ] Créer le fichier :

```typescript
import { defineStore } from 'pinia'
import type { AvatarResponse } from '~/types'

export const useAvatarStore = defineStore('avatar', () => {
  const avatar = ref<AvatarResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Stat la plus haute parmi les 6 — sert de référence pour les barres de progression
  const maxStat = computed(() => {
    if (!avatar.value) return 1
    const { strength, agility, endurance, intelligence, spirit, vitality } = avatar.value
    return Math.max(strength, agility, endurance, intelligence, spirit, vitality, 1)
  })

  async function fetchAvatar() {
    loading.value = true
    error.value = null
    try {
      avatar.value = await useApi<AvatarResponse>('/avatar/me')
    } catch {
      error.value = "Impossible de charger l'avatar."
    } finally {
      loading.value = false
    }
  }

  return { avatar, loading, error, maxStat, fetchAvatar }
})
```

- [ ] Commit :

```bash
git add app/stores/avatar.ts
git commit -m "feat: store Pinia avatar avec fetchAvatar et maxStat"
```

---

## Task 3 — Store Pinia parts

**Fichiers :** Créer `app/stores/parts.ts`

- [ ] Créer le fichier :

```typescript
import { defineStore } from 'pinia'
import type { Parts } from '~/types'

export const usePartsStore = defineStore('parts', () => {
  const stock = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchParts() {
    loading.value = true
    error.value = null
    try {
      const data = await useApi<Parts>('/parts/me')
      stock.value = data.stock
    } catch {
      error.value = 'Impossible de charger le stock de parties.'
    } finally {
      loading.value = false
    }
  }

  return { stock, loading, error, fetchParts }
})
```

- [ ] Commit :

```bash
git add app/stores/parts.ts
git commit -m "feat: store Pinia parts avec fetchParts"
```

---

## Task 4 — BottomNav

**Fichiers :** Créer `app/components/ui/BottomNav.vue`

- [ ] Créer le fichier :

```vue
<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'Accueil', icon: '🏠', path: '/dashboard' },
  { label: 'Activités', icon: '⚡', path: '/activities' },
  { label: 'Tournoi', icon: '🏆', path: '/tournament' },
  { label: 'Profil', icon: '👤', path: '/profile' },
]
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-[#1a1245] border-t border-questy-purple/30 z-50">
    <div class="grid grid-cols-4 max-w-lg mx-auto">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex flex-col items-center py-2 text-xs gap-1 transition-colors"
        :class="route.path === tab.path ? 'text-questy-purple' : 'text-questy-violet/60'"
      >
        <span class="text-lg leading-none">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
```

- [ ] Commit :

```bash
git add app/components/ui/BottomNav.vue
git commit -m "feat: BottomNav 4 onglets fixes

closes #67"
```

---

## Task 5 — StatBar

**Fichiers :** Créer `app/components/avatar/StatBar.vue`

- [ ] Créer le fichier :

```vue
<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number
  maxValue: number
  align?: 'left' | 'right'
}>()

const width = computed(() =>
  props.maxValue > 0 ? Math.round((props.value / props.maxValue) * 100) : 0
)
const isRight = computed(() => props.align === 'right')
</script>

<template>
  <div>
    <div class="flex justify-between text-xs mb-1">
      <span v-if="!isRight" class="text-questy-light/80">{{ label }}</span>
      <span class="font-bold" :class="isRight ? 'text-questy-violet' : 'text-questy-orange'">
        {{ value.toLocaleString('fr-FR') }}
      </span>
      <span v-if="isRight" class="text-questy-light/80">{{ label }}</span>
    </div>
    <div class="bg-[#1a1245] rounded-full h-1.5">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="isRight ? 'bg-questy-purple' : 'bg-questy-orange'"
        :style="{ width: `${width}%` }"
      />
    </div>
  </div>
</template>
```

- [ ] Commit :

```bash
git add app/components/avatar/StatBar.vue
git commit -m "feat: StatBar barre de progression relative au max"
```

---

## Task 6 — HeroClass

**Fichiers :** Créer `app/components/avatar/HeroClass.vue`

- [ ] Créer le fichier :

```vue
<script setup lang="ts">
defineProps<{ heroClass: string }>()
</script>

<template>
  <span class="inline-block bg-questy-violet/20 text-questy-violet text-xs font-semibold px-3 py-1 rounded-full border border-questy-violet/40">
    {{ heroClass }}
  </span>
</template>
```

- [ ] Commit :

```bash
git add app/components/avatar/HeroClass.vue
git commit -m "feat: HeroClass badge classe du héros"
```

---

## Task 7 — Avatar2D

**Fichiers :** Créer `app/components/avatar/Avatar2D.vue`

- [ ] Créer le fichier :

```vue
<script setup lang="ts">
const props = defineProps<{ heroClass: string }>()

const colorMap: Record<string, string> = {
  'Guerrier':        '#8B0000',
  'Voleur':          '#EAB308',
  'Tank':            '#92400E',
  'Mage':            '#60A5FA',
  'Prêtre':          '#F1F5F9',
  'Paladin':         '#F472B6',
  'Berserker':       '#E05A00',
  'Mage de guerre':  '#7A1C7A',
  'Druide':          '#7A9A5A',
  'Sage lettré':     '#4A9FD4',
  'Chevalier':       '#A02818',
  'Templier':        '#D4A020',
  'Champion':        '#C02060',
  'Rôdeur':          '#C07010',
  'Illusionniste':   '#40A060',
  'Moine':           '#E8C840',
  'Danseur de lame': '#E87040',
  'Alchimiste':      '#306080',
  'Colosse':         '#A04050',
  'Nécromant':       '#9040D0',
  'Chaman':          '#E890C0',
  'Aventurier':      '#6B7280',
}

const color = computed(() => colorMap[props.heroClass] ?? '#6B7280')
</script>

<template>
  <div
    class="w-16 h-20 bg-[#1a1245] rounded-xl border-2 flex items-center justify-center flex-shrink-0"
    :style="{ borderColor: color }"
  >
    <svg width="40" height="60" viewBox="0 0 32 48">
      <circle cx="16" cy="10" r="8" :fill="color" />
      <rect x="8" y="20" width="16" height="18" rx="3" :fill="color" />
      <rect x="4" y="20" width="6" height="14" rx="2" :fill="color" />
      <rect x="22" y="20" width="6" height="14" rx="2" :fill="color" />
      <rect x="8" y="38" width="6" height="10" rx="2" :fill="color" />
      <rect x="18" y="38" width="6" height="10" rx="2" :fill="color" />
    </svg>
  </div>
</template>
```

- [ ] Commit :

```bash
git add app/components/avatar/Avatar2D.vue
git commit -m "feat: Avatar2D SVG coloré selon heroClass (22 classes)"
```

---

## Task 8 — PartsDisplay

**Fichiers :** Créer `app/components/parts/PartsDisplay.vue`

- [ ] Créer le fichier :

```vue
<script setup lang="ts">
const props = defineProps<{ stock: number }>()

// Tableau de 12 booléens : true = cœur plein, false = cœur vide
const hearts = computed(() =>
  Array.from({ length: 12 }, (_, i) => i < props.stock)
)
</script>

<template>
  <div class="flex flex-wrap gap-0.5">
    <span v-for="(full, i) in hearts" :key="i" class="text-sm leading-none">
      {{ full ? '❤️' : '🤍' }}
    </span>
  </div>
</template>
```

- [ ] Commit :

```bash
git add app/components/parts/PartsDisplay.vue
git commit -m "feat: PartsDisplay 12 cœurs plein/vide"
```

---

## Task 9 — dashboard.vue

**Fichiers :** Réécrire `app/pages/dashboard.vue`

- [ ] Remplacer entièrement le contenu du fichier :

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const avatarStore = useAvatarStore()
const partsStore = usePartsStore()

const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    await Promise.all([avatarStore.fetchAvatar(), partsStore.fetchParts()])
  } catch {
    error.value = 'Erreur lors du chargement du profil.'
  } finally {
    loading.value = false
  }
})

// Progression XP dans le niveau courant (0-100%)
const xpPercent = computed(() => {
  if (!avatarStore.avatar) return 0
  const { xp, level, xpNextLevel } = avatarStore.avatar
  // XP total au début du niveau courant
  const xpCurrentLevel = (((level - 1) * level) / 2) * 100
  const range = xpNextLevel - xpCurrentLevel
  if (range <= 0) return 100
  return Math.min(Math.round(((xp - xpCurrentLevel) / range) * 100), 100)
})
</script>

<template>
  <div class="min-h-screen bg-questy-dark text-questy-light pb-16">

    <!-- Chargement -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="w-8 h-8 border-2 border-questy-purple border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Erreur -->
    <div v-else-if="error || !avatarStore.avatar" class="flex items-center justify-center min-h-screen p-4">
      <p class="text-red-400 text-center">{{ error ?? 'Profil introuvable.' }}</p>
    </div>

    <!-- Contenu principal -->
    <template v-else>

      <!-- Header : pseudo + cœurs -->
      <header class="flex justify-between items-center px-4 pt-6 pb-4 bg-[#1a1245]">
        <span class="font-bold">⚔️ {{ authStore.user?.pseudo }}</span>
        <PartsDisplay :stock="partsStore.stock" />
      </header>

      <!-- Classe + Niveau + Barre XP -->
      <div class="px-4 py-3 text-center">
        <HeroClass :hero-class="avatarStore.avatar.heroClass" />
        <p class="text-xs text-questy-violet mt-2">
          Niveau {{ avatarStore.avatar.level }}
          · {{ avatarStore.avatar.xp.toLocaleString('fr-FR') }} XP
        </p>
        <div class="mt-2 bg-[#1a1245] rounded-full h-2 max-w-xs mx-auto overflow-hidden">
          <div
            class="bg-questy-purple h-full rounded-full transition-all duration-700"
            :style="{ width: `${xpPercent}%` }"
          />
        </div>
      </div>

      <!-- Stats gauche + Avatar + Stats droite -->
      <div class="grid grid-cols-[1fr_auto_1fr] gap-3 px-4 py-4 items-center">
        <div class="flex flex-col gap-3">
          <StatBar label="Force"     :value="avatarStore.avatar.strength"     :max-value="avatarStore.maxStat" align="left" />
          <StatBar label="Agilité"   :value="avatarStore.avatar.agility"      :max-value="avatarStore.maxStat" align="left" />
          <StatBar label="Endurance" :value="avatarStore.avatar.endurance"    :max-value="avatarStore.maxStat" align="left" />
        </div>

        <Avatar2D :hero-class="avatarStore.avatar.heroClass" />

        <div class="flex flex-col gap-3">
          <StatBar label="Intel."   :value="avatarStore.avatar.intelligence" :max-value="avatarStore.maxStat" align="right" />
          <StatBar label="Esprit"   :value="avatarStore.avatar.spirit"       :max-value="avatarStore.maxStat" align="right" />
          <StatBar label="Vitalité" :value="avatarStore.avatar.vitality"     :max-value="avatarStore.maxStat" align="right" />
        </div>
      </div>

      <!-- CTAs -->
      <div class="grid grid-cols-2 gap-3 px-4 mt-2">
        <NuxtLink
          to="/activities"
          class="bg-questy-orange text-white text-center font-bold py-3 rounded-xl text-sm"
        >
          + Activité
        </NuxtLink>
        <NuxtLink
          to="/mini-games"
          class="bg-questy-purple text-white text-center font-bold py-3 rounded-xl text-sm"
        >
          Jouer
        </NuxtLink>
      </div>

    </template>

    <!-- Navbar fixe -->
    <BottomNav />
  </div>
</template>
```

- [ ] Démarrer le serveur de développement et vérifier visuellement dans le navigateur :

```bash
npm run dev
```

Ouvrir `http://localhost:3001/dashboard`. Vérifier :
- Header affiche pseudo + cœurs
- Avatar SVG coloré selon la heroClass
- 3 stats gauche (orange) / 3 stats droite (violet) avec barres proportionnelles
- Barre XP avec progression correcte
- Boutons "+ Activité" et "Jouer" navigables
- BottomNav fixe en bas, onglet Accueil actif

- [ ] Commit :

```bash
git add app/pages/dashboard.vue
git commit -m "feat: dashboard personnage RPG

closes #61
closes #62
closes #63
closes #64
closes #65
closes #66
closes #60"
```

---

## Task 10 — Push et PR

- [ ] Pusher la branche :

```bash
git push origin feature/dashboard
```

- [ ] Créer la PR `feature/dashboard` → `develop` sur GitHub avec :
  - **Titre :** `feat: US-09 Dashboard personnage RPG`
  - **Description :**
    ```
    Implémentation complète du dashboard fiche personnage RPG.

    - Avatar SVG coloré selon heroClass (22 classes)
    - 6 statistiques avec barres relatives au max
    - Classe du héros + niveau + barre XP
    - Stock de parties en cœurs (max 12)
    - 2 CTA : + Activité et Jouer
    - BottomNav 4 onglets

    closes #60
    closes #61
    closes #62
    closes #63
    closes #64
    closes #65
    closes #66
    closes #67
    ```
  - **Labels :** `feature` + `must-have`
  - **Milestone :** Milestone 2
