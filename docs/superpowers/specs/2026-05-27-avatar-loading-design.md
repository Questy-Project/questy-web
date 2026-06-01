# Design — Avatar Loading RPG

**Date :** 2026-05-27
**Scope :** questy-web / AvatarCanvas.vue uniquement

---

## Problème

Pendant le chargement des assets PNG de l'avatar, un placeholder cubique dessiné sur le canvas s'affiche brièvement. L'apparence est incohérente avec le style visuel du projet.

## Solution

Remplacer le placeholder canvas par un overlay HTML animé sur le thème RPG (⚔️ + barre dorée), affiché uniquement pendant le chargement.

---

## Composant concerné

`app/components/avatar/AvatarCanvas.vue`

### Modifications

1. **Supprimer** la fonction `drawPlaceholder()` et son appel conditionnel
2. **Wrapper** le `<canvas>` dans un `<div class="relative">`
3. **Ajouter** un overlay `v-if="!hasRendered"` avec :
   - Icône ⚔️ animée (translation verticale)
   - Barre de progression dorée (animation de remplissage gauche → droite)
4. **Masquer** le canvas tant que `hasRendered` est false (`opacity-0`) pour éviter un flash blanc

### Comportement

| État | Ce qui s'affiche |
|---|---|
| Assets en cours de chargement | Overlay ⚔️ + barre |
| Assets chargés (`hasRendered = true`) | Canvas avec avatar, overlay retiré du DOM |

---

## Contraintes

- L'overlay doit fonctionner à toutes les tailles d'affichage (le canvas est souvent zoomé `scale-[3]` côté parent)
- Tailwind CSS uniquement — pas de style inline sauf pour les animations CSS keyframes
- Aucun changement sur les composants parents ni sur les stores

---

## Fichiers modifiés

- `app/components/avatar/AvatarCanvas.vue`
