# Design — US-08 Page Déclaration d'Activité

**Date :** 2026-04-19
**Branche :** feature/activities
**Issues :** #52 (parent), #53–#59

---

## 1. Objectif

Permettre à l'utilisateur de déclarer une activité physique ou intellectuelle depuis l'application, en sélectionnant une activité du catalogue (ou une activité libre), une durée et une intensité. L'aperçu des gains XP et parties est visible en temps réel avant validation.

---

## 2. Layout

Page unique avec scroll vertical (mobile first). Pas de wizard multi-étapes — action répétée quotidiennement, friction minimale.

```
┌─────────────────────────────┐
│ Déclarer une activité        │  ← titre
├─────────────────────────────┤
│ [ Choisir une activité... ▼ ]│  ← ouvre bottom sheet
├─────────────────────────────┤
│ Durée : [30min][1h][1h30][2h+]│  ← chips
├─────────────────────────────┤
│ Intensité :                  │
│ [🚶 Légère ×1.0] [🏃 ×1.5] [🔥 ×2.0] │  ← 3 boutons
├─────────────────────────────┤
│ ⚡ +XX XP Force · +X ❤️       │  ← aperçu temps réel
├─────────────────────────────┤
│ [ ✓ Valider l'activité ]     │  ← CTA orange
├─────────────────────────────┤
│  🏠  ⚡  🏆  👤              │  ← BottomNav
└─────────────────────────────┘
```

---

## 3. Bottom Sheet — Sélection d'activité

S'ouvre au tap sur le champ "Choisir une activité". Composant `ActivitySheet.vue`.

- Barre de recherche → `GET /activities?search=xxx` (debounce 300ms)
- Filtres catégories en chips horizontaux scrollables (12 catégories issues du seed)
- Liste de résultats : nom + stat primaire
- Option "Autre activité" en bas → affiche deux champs : nom libre + catégorie libre
- Tap sur un résultat → ferme le sheet, sélectionne l'activité

---

## 4. Durée — chips

Valeurs fixes mappées en minutes :
- `30min` → 30
- `1h` → 60
- `1h30` → 90
- `2h+` → 120

Une seule sélection possible. Chip sélectionné en `bg-questy-purple`.

---

## 5. Intensité — 3 boutons

| Bouton | Valeur | Emoji |
|--------|--------|-------|
| Légère | 1.0 | 🚶 |
| Modérée | 1.5 | 🏃 |
| Intense | 2.0 | 🔥 |

Bouton sélectionné en `bg-questy-purple`. Multiplicateur affiché sous le label.

---

## 6. Aperçu des gains (temps réel)

Calculé côté client, mis à jour à chaque changement de durée ou d'intensité.

```
xpPreview = Math.round(duration × intensity × (activity?.xpMultiplier ?? 1.0))
partsPreview = duration <= 30 ? 2 : duration <= 60 ? 4 : 6
```

Affiché uniquement si durée ET intensité sont sélectionnées. Encadré orange `border-questy-orange`.

---

## 7. Store — useActivitiesStore

`stores/activities.ts`

- `selectedActivity: Activity | null` — activité choisie (catalogue ou libre)
- `customName: string` — nom libre si "Autre"
- `customCategory: string` — catégorie libre si "Autre"
- `duration: number | null` — minutes
- `intensity: number | null` — 1.0 / 1.5 / 2.0
- `loading: boolean`, `error: string | null`, `success: boolean`
- `fetchActivities(search?: string)` → `GET /activities?search=`
- `logActivity()` → `POST /activities/log`

---

## 8. Types à ajouter — types/index.ts

```ts
export interface Activity {
  id: string
  name: string
  category: string
  statPrimary: string
  statSecondary: string | null
  xpMultiplier: number
}

export interface ActivityLog {
  id: string
  duration: number
  intensity: number
  xpGained: number
  partsUnlocked: number
  loggedAt: string
}
```

---

## 9. Composants

| Composant | Rôle |
|-----------|------|
| `pages/activities.vue` | Page principale, middleware auth |
| `components/activity/ActivitySheet.vue` | Bottom sheet recherche + filtres + liste |
| `stores/activities.ts` | État local du formulaire + appels API |

---

## 10. Flux après validation

1. `POST /activities/log` → succès
2. Re-fetch avatar store (`avatarStore.fetchAvatar()`) pour mettre à jour les stats
3. Re-fetch parts store (`partsStore.fetchParts()`) pour mettre à jour les cœurs
4. Reset du formulaire
5. Afficher message de succès : "Activité enregistrée ! +XX XP · +X ❤️"
6. Redirect vers `/dashboard` après 2 secondes

---

## 11. Gestion des erreurs

- Plafond 180 min/jour dépassé → message en français depuis l'API
- Plafond 360 XP/jour dépassé → message en français depuis l'API
- Formulaire incomplet → bouton "Valider" désactivé si durée ou intensité manquante

---

## 12. Issues couvertes

| Issue | Description |
|-------|-------------|
| #53 | pages/activities.vue avec middleware auth |
| #54 | Barre de recherche avec suggestions instantanées |
| #55 | Filtres par catégorie en chips |
| #56 | Champ Autre : saisie libre + choix catégorie |
| #57 | Durée en chips : 30min / 1h / 1h30 / 2h+ |
| #58 | Intensité : 3 boutons Légère / Modérée / Intense |
| #59 | Aperçu des gains avant validation |
