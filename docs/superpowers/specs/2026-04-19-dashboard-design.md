# Design — US-09 Dashboard personnage RPG

**Date :** 2026-04-19
**Branche :** feature/dashboard
**Issues :** #60 (parent), #61–#67

---

## 1. Objectif

Afficher la fiche personnage RPG de l'utilisateur connecté : avatar, classe, niveau, XP, 6 statistiques et stock de parties. Point d'entrée principal de l'application après connexion.

---

## 2. Layout (mobile first)

Option retenue : **stats encadrant l'avatar** (3 gauche · avatar centré · 3 droite).

```
┌─────────────────────────────┐
│ pseudo          ❤❤❤❤❤       │  ← header
├─────────────────────────────┤
│ Classe · Niv. X  [====  ]   │  ← heroClass + barre XP
├──────────┬──────┬───────────┤
│ Force    │      │  Intel.   │
│ Agilité  │ SVG  │  Esprit   │  ← stats + avatar
│ Endurance│      │  Vitalité │
├──────────┴──────┴───────────┤
│  [ + Activité ]  [ Jouer ]  │  ← CTAs
├─────────────────────────────┤
│  🏠  ⚡  🏆  👤             │  ← BottomNav fixe
└─────────────────────────────┘
```

---

## 3. Types — app/types/index.ts

Ajouts :

```ts
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

---

## 4. Stores Pinia

### stores/avatar.ts
- `fetchAvatar()` → `GET /api/avatar/me` via `useApi()`
- State : `avatar: AvatarResponse | null`, `loading: boolean`, `error: string | null`
- Computed : `maxStat` = `Math.max(strength, agility, endurance, intelligence, spirit, vitality)` — minimum 1 pour éviter division par zéro

### stores/parts.ts
- `fetchParts()` → `GET /api/parts/me` via `useApi()`
- State : `stock: number`, `loading: boolean`, `error: string | null`

---

## 5. Composants

Ordre de création (dépendances d'abord) :

### components/ui/BottomNav.vue
- 4 onglets fixes en bas : Dashboard (`/dashboard`), Activités (`/activities`), Tournoi (`/tournament`), Profil (`/profile`)
- `useRoute()` pour marquer l'onglet actif (couleur `questy-purple`)
- `position: fixed; bottom: 0` — padding-bottom sur le contenu principal pour compenser

### components/avatar/StatBar.vue
Props : `label: string`, `value: number`, `maxValue: number`, `align: 'left' | 'right'`
- Barre de progression = `(value / maxValue) * 100%`
- `align: 'right'` inverse l'ordre label/valeur et le sens de remplissage (pour les stats droite)
- Couleur : `questy-orange` pour les stats gauche (physiques), `questy-purple` pour les stats droite (mentales)

### components/avatar/HeroClass.vue
Props : `heroClass: string`
- Badge pill coloré, texte `questy-light` sur fond `questy-violet`

### components/avatar/Avatar2D.vue
Props : `heroClass: string`
- SVG inline 60×80px, silhouette humanoïde simple
- Couleur computed par heroClass :

| Classe | Stats | Couleur |
|--------|-------|---------|
| Guerrier | Force | `#8B0000` |
| Voleur | Agilité | `#EAB308` |
| Tank | Endurance | `#92400E` |
| Mage | Intelligence | `#60A5FA` |
| Prêtre | Esprit | `#F1F5F9` |
| Paladin | Vitalité | `#F472B6` |
| Berserker | Force + Agilité | `#E05A00` |
| Mage de guerre | Force + Intelligence | `#7A1C7A` |
| Druide | Endurance + Esprit | `#7A9A5A` |
| Sage lettré | Intelligence + Esprit | `#4A9FD4` |
| Chevalier | Force + Endurance | `#A02818` |
| Templier | Force + Esprit | `#D4A020` |
| Champion | Force + Vitalité | `#C02060` |
| Rôdeur | Agilité + Endurance | `#C07010` |
| Illusionniste | Agilité + Intelligence | `#40A060` |
| Moine | Agilité + Esprit | `#E8C840` |
| Danseur de lame | Agilité + Vitalité | `#E87040` |
| Alchimiste | Endurance + Intelligence | `#306080` |
| Colosse | Endurance + Vitalité | `#A04050` |
| Nécromant | Intelligence + Vitalité | `#9040D0` |
| Chaman | Esprit + Vitalité | `#E890C0` |
| Aventurier | (défaut) | `#6B7280` |

### components/parts/PartsDisplay.vue
Props : `stock: number`
- Affiche 12 icônes : `stock` cœurs pleins (❤️), `12 - stock` cœurs vides (🤍)
- `flex-wrap` pour adaptation mobile

---

## 6. dashboard.vue

```
definePageMeta({ middleware: 'auth' })

onMounted → Promise.all([avatarStore.fetchAvatar(), partsStore.fetchParts()])
```

- État `loading` : spinner centré pendant le chargement
- État `error` : message d'erreur en français si une des deux requêtes échoue
- État `success` : affiche le dashboard complet

**Flux props :**
```
avatarStore.avatar     → Avatar2D (heroClass)
                       → HeroClass (heroClass)
                       → StatBar ×6 (value, maxValue = avatarStore.maxStat)
                       → barre XP inline (xp, xpNextLevel)
partsStore.stock       → PartsDisplay (stock)
                       → header (affichage direct)
```

---

## 7. Navigation

- `+ Activité` → `navigateTo('/activities')`
- `Jouer` → `navigateTo('/mini-games')` (page placeholder, mini-jeux non implémentés)
- `BottomNav` → navigation standard entre les 4 sections

---

## 8. Issues couvertes

| Issue | Description |
|-------|-------------|
| #61 | pages/dashboard.vue avec middleware auth |
| #62 | Header : pseudo + stock de parties en cœurs |
| #63 | Classe du héros + niveau + barre XP |
| #64 | Avatar statique centré |
| #65 | 3 stats gauche / 3 stats droite |
| #66 | 2 CTA : + Activité et Jouer |
| #67 | Navbar fixe en bas (4 onglets) |
