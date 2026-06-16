# Design — Avatar pixel art customisable

**Date :** 2026-05-12
**Projet :** Questy — questy-web + questy-api
**Statut :** Approuvé

---

## Contexte

L'`Avatar2D.vue` actuel est un SVG monochrome basique (rectangles colorés selon la heroClass). L'objectif est de remplacer ce composant par un vrai avatar pixel art customisable par l'utilisateur, basé sur des assets PNG réels exportés depuis le LPC Generator.

---

## Décisions clés

| Sujet | Décision |
|---|---|
| Style visuel | Pixel art authentique (PNG sprites, `image-rendering: pixelated`) |
| Source des assets | Universal LPC Spritesheet Generator (CC-BY-SA) |
| Rendu | Canvas API — compositing de 9 calques PNG |
| Customisation utilisateur | Silhouette, ton de peau, coiffure, couleur cheveux |
| Équipement | Automatique selon heroClass (outfit + armor + weapon) |
| Animations | Hors scope — prévu phase 2 (idle + victoire, spritesheet) |
| Boutique cosmétiques | Hors scope — prévu phase 3 (colonnes DB + UI à ajouter) |

---

## Ordre de rendu Canvas (9 calques)

```
1. body          silhouette + ton de peau
2. hair          coiffure + couleur (sous tout)
3. outfit_legs   pantalon / jupe de classe
4. outfit_torso  vêtement torse de classe
5. outfit_head   chapeau / capuche / auréole / bois (par-dessus cheveux)
6. armor_legs    armure jambes (si classe concernée)
7. armor_torso   armure torse (si classe concernée)
8. armor_head    casque (par-dessus outfit_head, le couvre complètement)
9. weapon        arme tenue en main
```

Calques armor = `null` si non applicable → skippés silencieusement dans le Canvas.

---

## Structure des assets (public/avatar/)

```
public/avatar/
  body/
    A_skin1.png … A_skin5.png     (silhouette A, 5 tons de peau)
    B_skin1.png … B_skin5.png     (silhouette B, 5 tons de peau)
  hair/
    style1_color1.png … style4_color6.png   (4 styles × 6 couleurs = 24 PNG)
  outfit/
    head/    {classe}_default.png   (toutes les classes — voir tableau)
    torso/   {classe}_default.png
    legs/    {classe}_default.png
  armor/
    head/    {classe}_default.png   (classes avec casque uniquement)
    torso/   {classe}_default.png
    legs/    {classe}_default.png
  weapon/
    {classe}_default.png
```

**Convention de nommage :** `{classe}_default.png` — le suffixe `_default` permet d'ajouter des variantes (`_heavy`, `_rogue`…) sans refactoring quand la boutique arrive.

**Silhouette A / B :** corps masculin (A) et corps féminin (B) au sens LPC — désigne la morphologie, pas le genre. L'utilisateur choisit librement sans label de genre dans l'UI.

**Volume total :** ~120–130 PNG.

---

## Référence des couvre-chefs par classe

**Règle armor_torso / armor_legs :** toutes les classes avec `armor_head` ont aussi `armor_torso` et `armor_legs`. Classes avec `armor_torso/legs` uniquement (sans casque) : Rôdeur (cuir léger), Danseur de lame (cuir léger). Toutes les autres classes n'ont pas de calques armor.

| Classe | outfit_head | armor_head |
|---|---|---|
| Guerrier | Heaume de base | ✓ Casque lourd |
| Voleur | Capuchon | — |
| Tank | Heaume de base | ✓ Casque lourd |
| Mage | Chapeau pointu | — |
| Prêtre | Auréole | — |
| Paladin | Heaume de base | ✓ Casque lourd |
| Berserker | Heaume de base | ✓ Casque lourd |
| Mage de guerre | Heaume arcaniste | ✓ Casque arcaniste |
| Druide | Bois de cerf | — |
| Sage lettré | Toque de lettré | — |
| Chevalier | Heaume de base | ✓ Casque lourd |
| Templier | Heaume de base | ✓ Casque lourd |
| Champion | Heaume de base | ✓ Casque lourd |
| Rôdeur | Capuchon | — |
| Illusionniste | Chapeau pointu / capuche | — |
| Moine | Bandeau | — |
| Danseur de lame | Capuchon | — |
| Alchimiste | Lunettes / chapeau alchimiste | — |
| Colosse | Heaume de base | ✓ Casque lourd |
| Nécromant | Capuche obscure | — |
| Chaman | Coiffe chamanique | — |
| Aventurier | Bandana basique | — |

---

## Workflow LPC Generator

1. Ouvrir `sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator`
2. Sélectionner les options pour une combinaison (ex : body A, skin 2)
3. Exporter chaque calque séparément en PNG (option "individual layers")
4. Extraire la frame statique idle (frame 0) — 64×64px ou 64×88px selon LPC
5. Nommer selon la convention et placer dans `public/avatar/`

---

## Backend — modifications

### Table `avatars` — nouvelles colonnes

```typescript
@Column({ default: 'A' })
silhouette: string;   // 'A' | 'B'

@Column({ default: 1 })
skinTone: number;     // 1–5

@Column({ default: 1 })
hairStyle: number;    // 1–4

@Column({ default: 1 })
hairColor: number;    // 1–6
```

### Endpoints

- `GET /api/avatar` — modifié : retourne les 4 nouvelles colonnes en plus des stats existantes
- `PATCH /api/avatar/customization` — nouveau : met à jour les 4 champs, protégé `JwtAuthGuard`

### Inscription

`RegisterDto` étendu avec les 4 champs optionnels. `AuthService.register()` les passe à la création de l'avatar (valeurs par défaut si absents).

---

## Frontend — nouveaux fichiers

### `components/avatar/AvatarCanvas.vue`
Composant d'affichage uniquement. Remplace `Avatar2D.vue`.
- Props : `{ silhouette, skinTone, hairStyle, hairColor, heroClass }`
- Composite les 9 calques sur `<canvas>` 64×88px
- `image-rendering: pixelated` via CSS
- Utilise `useAvatarAssets()`

### `components/avatar/AvatarCustomizer.vue`
Composant de sélection avec preview live.
- Affiche `AvatarCanvas` mis à jour en temps réel
- Pickers : silhouette (A/B), ton de peau (1–5), coiffure (1–4), couleur cheveux (1–6)
- Émet `@update` avec les nouvelles valeurs
- Utilisé dans `auth.vue` (étape 2) et `profile.vue`

### `composables/useAvatarAssets.ts`
- Construit les chemins PNG selon les props et la heroClass
- Cache les `HTMLImageElement` pour éviter les rechargements
- Retourne les 9 images prêtes à `ctx.drawImage()`
- Calques armor = `null` si la classe n'en a pas

### `stores/avatar.ts` — étendu
- Ajoute `silhouette`, `skinTone`, `hairStyle`, `hairColor` à l'état existant
- Nouvelle action `updateCustomization()` → `PATCH /api/avatar/customization`
- `fetchAvatar()` existant récupère les nouvelles colonnes automatiquement

### Pages modifiées
- `auth.vue` — ajout d'une étape 2 après inscription avec `AvatarCustomizer.vue`
- `dashboard.vue` — remplace `Avatar2D` par `AvatarCanvas`
- `profile.vue` — section "Modifier mon avatar" avec `AvatarCustomizer.vue`

---

## Flux d'inscription

```
Étape 1 : pseudo + email + mdp (formulaire existant)
    ↓
Étape 2 : AvatarCustomizer.vue (preview live)
    ↓
Dashboard : avatar customisé visible immédiatement
```

Si l'utilisateur saute l'étape 2 → valeurs par défaut appliquées.

---

## Prévisions phase 2 — Animations

- Remplacer les PNG frame 0 par des spritesheets complètes
- Ajouter `animationFrame` au compositing Canvas
- Animations prévues : idle (boucle), victoire (débloquage de parties)
- `AvatarCanvas.vue` est conçu pour accepter ce swap sans refactoring de l'interface

## Prévisions phase 3 — Boutique cosmétiques

- Nouvelles colonnes DB : `equippedOutfitHead`, `equippedOutfitTorso`, `equippedOutfitLegs`, `equippedArmorHead`, `equippedArmorTorso`, `equippedArmorLegs`, `equippedWeapon`
- Table `cosmetics` : catalogue d'items achetables par classe
- Table `user_cosmetics` : inventaire de l'utilisateur
- Assets nommés `{classe}_{style}.png` — structure compatible sans renommage
