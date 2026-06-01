# Avatar pixel art customisable — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer l'Avatar2D SVG monochrome par un avatar pixel art composité par calques PNG, customisable par l'utilisateur (silhouette, peau, coiffure) avec équipement automatique selon la heroClass.

**Architecture:** Canvas API composite 9 calques PNG dans `AvatarCanvas.vue`. Les assets PNG sont exportés manuellement depuis le LPC Generator et stockés dans `public/avatar/`. La customisation est persistée en base dans la table `avatars` (4 nouvelles colonnes) et modifiable depuis le profil ou à l'inscription.

**Tech Stack:** NestJS + TypeORM (backend), Nuxt 3 + Canvas API + Pinia (frontend), Universal LPC Spritesheet Generator (assets)

**Spec de référence:** `docs/superpowers/specs/2026-05-12-avatar-customization-design.md`

---

## Fichiers concernés

### Backend (questy-api)
| Action | Fichier |
|---|---|
| Modifier | `src/avatar/entities/avatar.entity.ts` |
| Créer | `src/avatar/dto/update-avatar-customization.dto.ts` |
| Modifier | `src/avatar/avatar.service.ts` |
| Modifier | `src/avatar/avatar.controller.ts` |
| Modifier | `src/auth/dto/register.dto.ts` |
| Modifier | `src/auth/auth.service.ts` |

### Frontend (questy-web)
| Action | Fichier |
|---|---|
| Modifier | `app/types/index.ts` |
| Modifier | `app/stores/avatar.ts` |
| Modifier | `app/stores/auth.ts` |
| Créer | `app/composables/useAvatarAssets.ts` |
| Créer | `app/components/avatar/AvatarCanvas.vue` |
| Créer | `app/components/avatar/AvatarCustomizer.vue` |
| Modifier | `app/pages/dashboard.vue` |
| Modifier | `app/pages/profile.vue` |
| Modifier | `app/pages/auth.vue` |

### Assets (manuel — pas de code)
| Action | Dossier |
|---|---|
| Créer | `public/avatar/body/`, `hair/`, `outfit/head|torso|legs/`, `armor/head|torso|legs/`, `weapon/` |

---

## Task 1 — Colonnes customisation dans l'entité Avatar

**Fichiers :**
- Modifier : `questy-api/src/avatar/entities/avatar.entity.ts`
- Créer : `questy-api/src/avatar/dto/update-avatar-customization.dto.ts`

- [ ] **Étape 1 : Ajouter les 4 colonnes à l'entité**

Remplacer le contenu de `src/avatar/entities/avatar.entity.ts` :

```typescript
import { Column, Entity, JoinColumn, OneToOne,
PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('avatars')
export class Avatar {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @Column()
  userId!: string;

  @Column({ default: 1 })
  level!: number;

  @Column({ default: 0 })
  xp!: number;

  @Column({ default: 'Aventurier' })
  heroClass!: string;

  @Column({ default: 0 })
  strength!: number;

  @Column({ default: 0 })
  agility!: number;

  @Column({ default: 0 })
  endurance!: number;

  @Column({ default: 0 })
  intelligence!: number;

  @Column({ default: 0 })
  spirit!: number;

  @Column({ default: 0 })
  vitality!: number;

  // Customisation avatar — silhouette A (corps masc.) ou B (corps fém.)
  @Column({ default: 'A' })
  silhouette!: string;

  @Column({ default: 1 })
  skinTone!: number;

  @Column({ default: 1 })
  hairStyle!: number;

  @Column({ default: 1 })
  hairColor!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

- [ ] **Étape 2 : Créer le DTO de mise à jour**

Créer `src/avatar/dto/update-avatar-customization.dto.ts` :

```typescript
import { IsIn, IsInt, Max, Min } from 'class-validator';

export class UpdateAvatarCustomizationDto {
  @IsIn(['A', 'B'])
  silhouette!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  skinTone!: number;

  @IsInt()
  @Min(1)
  @Max(4)
  hairStyle!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  hairColor!: number;
}
```

- [ ] **Étape 3 : Vérifier que NestJS démarre sans erreur**

```bash
cd questy-api && npm run start:dev
```

Attendu : aucune erreur TypeORM, les 4 colonnes sont ajoutées automatiquement (`synchronize: true`).

- [ ] **Étape 4 : Commit**

```bash
git add src/avatar/entities/avatar.entity.ts src/avatar/dto/update-avatar-customization.dto.ts
git commit -m "feat(avatar): ajoute les colonnes de customisation à l'entité"
```

---

## Task 2 — Service : updateCustomization()

**Fichiers :**
- Modifier : `questy-api/src/avatar/avatar.service.ts`

- [ ] **Étape 1 : Ajouter la méthode updateCustomization au service**

Ajouter à la fin de la classe `AvatarService`, avant la dernière accolade :

```typescript
async updateCustomization(
  userId: string,
  dto: UpdateAvatarCustomizationDto,
): Promise<Avatar> {
  const avatar = await this.findByUserId(userId);
  avatar.silhouette = dto.silhouette;
  avatar.skinTone = dto.skinTone;
  avatar.hairStyle = dto.hairStyle;
  avatar.hairColor = dto.hairColor;
  return this.avatarRepository.save(avatar);
}
```

Ajouter l'import du DTO en haut du fichier :

```typescript
import { UpdateAvatarCustomizationDto } from './dto/update-avatar-customization.dto';
```

- [ ] **Étape 2 : Vérifier que le build compile**

```bash
cd questy-api && npm run build
```

Attendu : aucune erreur TypeScript.

- [ ] **Étape 3 : Commit**

```bash
git add src/avatar/avatar.service.ts
git commit -m "feat(avatar): ajoute updateCustomization dans AvatarService"
```

---

## Task 3 — Controller : PATCH /avatar/customization

**Fichiers :**
- Modifier : `questy-api/src/avatar/avatar.controller.ts`

- [ ] **Étape 1 : Ajouter l'endpoint PATCH et mettre à jour GET**

Remplacer le contenu de `src/avatar/avatar.controller.ts` :

```typescript
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateAvatarCustomizationDto } from './dto/update-avatar-customization.dto';

@UseGuards(JwtAuthGuard)
@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Get('me')
  async getMyAvatar(@Req() req: any) {
    const avatar = await this.avatarService.findByUserId(req.user.userId);
    const xpNextLevel = this.avatarService.xpForLevel(avatar.level + 1);
    return { ...avatar, xpNextLevel };
  }

  @Patch('customization')
  async updateCustomization(@Req() req: any, @Body() dto: UpdateAvatarCustomizationDto) {
    return this.avatarService.updateCustomization(req.user.userId, dto);
  }
}
```

- [ ] **Étape 2 : Tester manuellement avec un client HTTP (Insomnia / Postman / curl)**

```bash
# 1. Se connecter pour obtenir un token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"motdepasse"}'

# 2. Appeler PATCH avec le token
curl -X PATCH http://localhost:3000/api/avatar/customization \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"silhouette":"B","skinTone":3,"hairStyle":2,"hairColor":4}'
```

Attendu : réponse 200 avec l'avatar mis à jour incluant les 4 nouveaux champs.

- [ ] **Étape 3 : Vérifier que GET /avatar/me retourne aussi les nouveaux champs**

```bash
curl http://localhost:3000/api/avatar/me \
  -H "Authorization: Bearer <TOKEN>"
```

Attendu : réponse incluant `silhouette`, `skinTone`, `hairStyle`, `hairColor`.

- [ ] **Étape 4 : Commit**

```bash
git add src/avatar/avatar.controller.ts
git commit -m "feat(avatar): ajoute endpoint PATCH customization"
```

---

## Task 4 — Inscription avec customisation initiale

**Fichiers :**
- Modifier : `questy-api/src/auth/dto/register.dto.ts`
- Modifier : `questy-api/src/auth/auth.service.ts`

- [ ] **Étape 1 : Étendre RegisterDto avec les 4 champs optionnels**

Remplacer le contenu de `src/auth/dto/register.dto.ts` :

```typescript
import { IsEmail, IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  pseudo!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsIn(['A', 'B'])
  silhouette?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  skinTone?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  hairStyle?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  hairColor?: number;
}
```

- [ ] **Étape 2 : Passer les champs à la création de l'avatar dans AuthService**

Dans `src/auth/auth.service.ts`, remplacer la ligne de création de l'avatar :

```typescript
// Avant
await this.avatarRepository.save(this.avatarRepository.create({ userId: user.id }));

// Après
await this.avatarRepository.save(
  this.avatarRepository.create({
    userId: user.id,
    silhouette: dto.silhouette ?? 'A',
    skinTone: dto.skinTone ?? 1,
    hairStyle: dto.hairStyle ?? 1,
    hairColor: dto.hairColor ?? 1,
  }),
);
```

- [ ] **Étape 3 : Tester l'inscription avec et sans customisation**

```bash
# Avec customisation
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"pseudo":"TestUser","email":"test2@test.com","password":"password123","silhouette":"B","skinTone":2}'

# Sans customisation (valeurs par défaut)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"pseudo":"TestUser2","email":"test3@test.com","password":"password123"}'
```

Attendu : les deux fonctionnent, le second utilise les valeurs par défaut (silhouette A, skinTone 1, etc.).

- [ ] **Étape 4 : Commit**

```bash
git add src/auth/dto/register.dto.ts src/auth/auth.service.ts
git commit -m "feat(auth): inscription accepte la customisation initiale de l'avatar"
```

---

## Task 5 — Structure des assets (travail manuel)

> ⚠️ Cette tâche ne contient pas de code. Elle documente les PNGs à créer via le LPC Generator.

**Outil :** `sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator`

- [ ] **Étape 1 : Créer la structure de dossiers**

Dans `questy-web/public/avatar/` créer les dossiers :
```
public/avatar/
  body/
  hair/
  outfit/head/
  outfit/torso/
  outfit/legs/
  armor/head/
  armor/torso/
  armor/legs/
  weapon/
```

- [ ] **Étape 2 : Créer des placeholders PNG temporaires (1×1 pixel transparent)**

Pour que le frontend fonctionne pendant le développement, placer un fichier `placeholder.png` (1×1 pixel transparent) ou créer des PNG colorés simples pour chaque slot.

Convention de nommage complète à respecter :
- Body : `A_skin1.png` → `A_skin5.png`, `B_skin1.png` → `B_skin5.png`
- Hair : `style1_color1.png` → `style4_color6.png`
- Outfit/armor/weapon : `{slug}_default.png` avec les slugs suivants :

```
guerrier, voleur, tank, mage, pretre, paladin,
berserker, mage_de_guerre, druide, sage_lettre,
chevalier, templier, champion, rodeur, illusionniste,
moine, danseur_de_lame, alchimiste, colosse, necromant,
chaman, aventurier
```

- [ ] **Étape 3 : Exporter depuis LPC Generator**

Pour chaque combinaison body/hair, et pour chaque classe :
1. Configurer le générateur avec les options voulues
2. Sélectionner l'export en calques individuels
3. Extraire la frame idle (frame 0, position x=0 dans le spritesheet)
4. Recadrer à 64×64px
5. Nommer selon la convention et placer dans le bon dossier

- [ ] **Étape 4 : Commit des placeholders**

```bash
git add public/avatar/
git commit -m "chore(assets): structure dossiers avatar + placeholders"
```

---

## Task 6 — Types TypeScript + composable useAvatarAssets

**Fichiers :**
- Modifier : `questy-web/app/types/index.ts`
- Créer : `questy-web/app/composables/useAvatarAssets.ts`

- [ ] **Étape 1 : Étendre les types**

Dans `app/types/index.ts`, remplacer l'interface `Avatar` :

```typescript
export interface AvatarCustomization {
  silhouette: string;
  skinTone: number;
  hairStyle: number;
  hairColor: number;
}

export interface Avatar {
  id: string;
  level: number;
  xp: number;
  heroClass: string;
  strength: number;
  agility: number;
  endurance: number;
  intelligence: number;
  spirit: number;
  vitality: number;
  silhouette: string;
  skinTone: number;
  hairStyle: number;
  hairColor: number;
}

export interface AvatarResponse extends Avatar {
  xpNextLevel: number;
}
```

- [ ] **Étape 2 : Créer useAvatarAssets.ts**

Créer `app/composables/useAvatarAssets.ts` :

```typescript
// Slugs de fichiers normalisés par heroClass (accents et espaces retirés)
const HERO_CLASS_SLUG: Record<string, string> = {
  'Aventurier':      'aventurier',
  'Guerrier':        'guerrier',
  'Voleur':          'voleur',
  'Tank':            'tank',
  'Mage':            'mage',
  'Prêtre':          'pretre',
  'Paladin':         'paladin',
  'Berserker':       'berserker',
  'Mage de guerre':  'mage_de_guerre',
  'Druide':          'druide',
  'Sage lettré':     'sage_lettre',
  'Chevalier':       'chevalier',
  'Templier':        'templier',
  'Champion':        'champion',
  'Rôdeur':          'rodeur',
  'Illusionniste':   'illusionniste',
  'Moine':           'moine',
  'Danseur de lame': 'danseur_de_lame',
  'Alchimiste':      'alchimiste',
  'Colosse':         'colosse',
  'Nécromant':       'necromant',
  'Chaman':          'chaman',
};

// Classes avec calque armor_head
const CLASSES_WITH_ARMOR_HEAD = new Set([
  'guerrier', 'tank', 'paladin', 'berserker',
  'mage_de_guerre', 'chevalier', 'templier', 'champion', 'colosse',
]);

// Classes avec armor_torso + armor_legs (inclut celles avec armor_head + rôdeur et danseur)
const CLASSES_WITH_ARMOR_BODY = new Set([
  ...CLASSES_WITH_ARMOR_HEAD,
  'rodeur',
  'danseur_de_lame',
]);

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { imageCache.set(src, img); resolve(img); };
    // Si le fichier n'existe pas encore (placeholder manquant), on passe silencieusement
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export interface AvatarLayers {
  body: HTMLImageElement | null;
  hair: HTMLImageElement | null;
  outfitLegs: HTMLImageElement | null;
  outfitTorso: HTMLImageElement | null;
  outfitHead: HTMLImageElement | null;
  armorLegs: HTMLImageElement | null;
  armorTorso: HTMLImageElement | null;
  armorHead: HTMLImageElement | null;
  weapon: HTMLImageElement | null;
}

export async function useAvatarAssets(
  silhouette: string,
  skinTone: number,
  hairStyle: number,
  hairColor: number,
  heroClass: string,
): Promise<AvatarLayers> {
  const slug = HERO_CLASS_SLUG[heroClass] ?? 'aventurier';
  const base = '/avatar';

  const hasArmorHead = CLASSES_WITH_ARMOR_HEAD.has(slug);
  const hasArmorBody = CLASSES_WITH_ARMOR_BODY.has(slug);

  const [body, hair, outfitLegs, outfitTorso, outfitHead, armorLegs, armorTorso, armorHead, weapon] =
    await Promise.all([
      loadImage(`${base}/body/${silhouette}_skin${skinTone}.png`),
      loadImage(`${base}/hair/style${hairStyle}_color${hairColor}.png`),
      loadImage(`${base}/outfit/legs/${slug}_default.png`),
      loadImage(`${base}/outfit/torso/${slug}_default.png`),
      loadImage(`${base}/outfit/head/${slug}_default.png`),
      hasArmorBody ? loadImage(`${base}/armor/legs/${slug}_default.png`) : Promise.resolve(null),
      hasArmorBody ? loadImage(`${base}/armor/torso/${slug}_default.png`) : Promise.resolve(null),
      hasArmorHead ? loadImage(`${base}/armor/head/${slug}_default.png`) : Promise.resolve(null),
      loadImage(`${base}/weapon/${slug}_default.png`),
    ]);

  return { body, hair, outfitLegs, outfitTorso, outfitHead, armorLegs, armorTorso, armorHead, weapon };
}
```

- [ ] **Étape 3 : Commit**

```bash
git add app/types/index.ts app/composables/useAvatarAssets.ts
git commit -m "feat(avatar): types customisation + composable useAvatarAssets"
```

---

## Task 7 — Composant AvatarCanvas.vue

**Fichiers :**
- Créer : `questy-web/app/components/avatar/AvatarCanvas.vue`

> Nuxt auto-import : `components/avatar/AvatarCanvas.vue` → utilisable comme `<AvatarAvatarCanvas>` dans les templates.

- [ ] **Étape 1 : Créer AvatarCanvas.vue**

```vue
<script setup lang="ts">
import { useAvatarAssets } from '~/composables/useAvatarAssets';

const props = defineProps<{
  silhouette: string;
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  heroClass: string;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

async function draw() {
  const el = canvas.value;
  if (!el) return;
  const ctx = el.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, 64, 64);

  const layers = await useAvatarAssets(
    props.silhouette,
    props.skinTone,
    props.hairStyle,
    props.hairColor,
    props.heroClass,
  );

  // Rendu dans l'ordre des 9 calques — null = calque absent, ignoré
  const order = [
    layers.body,
    layers.hair,
    layers.outfitLegs,
    layers.outfitTorso,
    layers.outfitHead,
    layers.armorLegs,
    layers.armorTorso,
    layers.armorHead,
    layers.weapon,
  ];

  for (const img of order) {
    if (img) ctx.drawImage(img, 0, 0, 64, 64);
  }
}

watch(
  () => [props.silhouette, props.skinTone, props.hairStyle, props.hairColor, props.heroClass],
  () => draw(),
  { immediate: false },
);

onMounted(() => draw());
</script>

<template>
  <canvas
    ref="canvas"
    width="64"
    height="64"
    class="block"
    style="image-rendering: pixelated; image-rendering: crisp-edges;"
  />
</template>
```

- [ ] **Étape 2 : Vérifier dans le navigateur**

Lancer `npm run dev` dans `questy-web` et naviguer sur `/dashboard`. Le canvas s'affiche (vide ou avec les placeholders si déjà créés).

- [ ] **Étape 3 : Commit**

```bash
git add app/components/avatar/AvatarCanvas.vue
git commit -m "feat(avatar): composant AvatarCanvas avec compositing 9 calques"
```

---

## Task 8 — Composant AvatarCustomizer.vue

**Fichiers :**
- Créer : `questy-web/app/components/avatar/AvatarCustomizer.vue`

> Nuxt auto-import : accessible comme `<AvatarAvatarCustomizer>` dans les templates.

- [ ] **Étape 1 : Créer AvatarCustomizer.vue**

```vue
<script setup lang="ts">
import type { AvatarCustomization } from '~/types';

const props = defineProps<{
  heroClass: string;
  initial?: Partial<AvatarCustomization>;
}>();

const emit = defineEmits<{
  update: [customization: AvatarCustomization];
}>();

const silhouette = ref(props.initial?.silhouette ?? 'A');
const skinTone = ref(props.initial?.skinTone ?? 1);
const hairStyle = ref(props.initial?.hairStyle ?? 1);
const hairColor = ref(props.initial?.hairColor ?? 1);

const SKIN_COLORS = ['#FDDBB4', '#E8B88A', '#C68642', '#8D5524', '#4A2912'];
const HAIR_COLORS = ['#1a0a00', '#5C3317', '#A0522D', '#DAA520', '#C0C0C0', '#FF4500'];

function emit_update() {
  emit('update', {
    silhouette: silhouette.value,
    skinTone: skinTone.value,
    hairStyle: hairStyle.value,
    hairColor: hairColor.value,
  });
}

watch([silhouette, skinTone, hairStyle, hairColor], emit_update);
</script>

<template>
  <div class="flex flex-col items-center gap-6">

    <!-- Preview live -->
    <div class="bg-questy-sheet/90 border border-questy-gold/40 p-4 flex flex-col items-center gap-1">
      <span class="text-[9px] text-questy-gold/50 uppercase tracking-widest font-bold">Aperçu</span>
      <div class="scale-[3] my-4">
        <AvatarAvatarCanvas
          :silhouette="silhouette"
          :skin-tone="skinTone"
          :hair-style="hairStyle"
          :hair-color="hairColor"
          :hero-class="heroClass"
        />
      </div>
    </div>

    <!-- Silhouette -->
    <div class="w-full space-y-2">
      <p class="text-xs text-questy-gold/70 uppercase tracking-widest">Silhouette</p>
      <div class="flex gap-3">
        <button
          v-for="s in ['A', 'B']"
          :key="s"
          class="flex-1 py-2 border text-sm font-bold uppercase tracking-widest transition-colors"
          :class="silhouette === s
            ? 'border-questy-gold bg-questy-gold/20 text-questy-gold'
            : 'border-questy-gold/30 text-questy-light/50 hover:border-questy-gold/60'"
          @click="silhouette = s"
        >
          {{ s === 'A' ? 'Corps A' : 'Corps B' }}
        </button>
      </div>
    </div>

    <!-- Ton de peau -->
    <div class="w-full space-y-2">
      <p class="text-xs text-questy-gold/70 uppercase tracking-widest">Teinte de peau</p>
      <div class="flex gap-2">
        <button
          v-for="(color, i) in SKIN_COLORS"
          :key="i"
          class="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110"
          :class="skinTone === i + 1 ? 'border-questy-gold scale-110' : 'border-transparent'"
          :style="{ backgroundColor: color }"
          @click="skinTone = i + 1"
        />
      </div>
    </div>

    <!-- Coiffure -->
    <div class="w-full space-y-2">
      <p class="text-xs text-questy-gold/70 uppercase tracking-widest">Coiffure</p>
      <div class="flex gap-2">
        <button
          v-for="n in 4"
          :key="n"
          class="flex-1 py-2 border text-xs font-bold transition-colors"
          :class="hairStyle === n
            ? 'border-questy-gold bg-questy-gold/20 text-questy-gold'
            : 'border-questy-gold/30 text-questy-light/50 hover:border-questy-gold/60'"
          @click="hairStyle = n"
        >
          Style {{ n }}
        </button>
      </div>
    </div>

    <!-- Couleur des cheveux -->
    <div class="w-full space-y-2">
      <p class="text-xs text-questy-gold/70 uppercase tracking-widest">Couleur des cheveux</p>
      <div class="flex gap-2">
        <button
          v-for="(color, i) in HAIR_COLORS"
          :key="i"
          class="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110"
          :class="hairColor === i + 1 ? 'border-questy-gold scale-110' : 'border-transparent'"
          :style="{ backgroundColor: color }"
          @click="hairColor = i + 1"
        />
      </div>
    </div>

  </div>
</template>
```

- [ ] **Étape 2 : Commit**

```bash
git add app/components/avatar/AvatarCustomizer.vue
git commit -m "feat(avatar): composant AvatarCustomizer avec preview live"
```

---

## Task 9 — Store avatar + store auth

**Fichiers :**
- Modifier : `questy-web/app/stores/avatar.ts`
- Modifier : `questy-web/app/stores/auth.ts`

- [ ] **Étape 1 : Ajouter updateCustomization au store avatar**

Dans `app/stores/avatar.ts`, ajouter l'import du type et la nouvelle action. Remplacer le contenu du fichier :

```typescript
import { defineStore } from 'pinia';
import type { AvatarCustomization, AvatarResponse } from '~/types';

export const useAvatarStore = defineStore('avatar', () => {
  const avatar = ref<AvatarResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const xpPercent = computed(() => {
    if (!avatar.value) return 0;
    const { xp, xpNextLevel, level } = avatar.value;
    const xpCurrentLevel = (((level - 1) * level) / 2) * 100;
    const range = xpNextLevel - xpCurrentLevel;
    if (range <= 0) return 100;
    return Math.min(Math.round(((xp - xpCurrentLevel) / range) * 100), 100);
  });

  // Stat la plus haute parmi les 6 — sert de référence pour les barres de progression
  const maxStat = computed(() => {
    if (!avatar.value) return 1;
    const { strength, agility, endurance, intelligence, spirit, vitality } = avatar.value;
    return Math.max(strength, agility, endurance, intelligence, spirit, vitality, 1);
  });

  async function fetchAvatar() {
    loading.value = true;
    error.value = null;
    try {
      avatar.value = await useApi<AvatarResponse>('/avatar/me');
    } catch {
      error.value = "Impossible de charger l'avatar.";
    } finally {
      loading.value = false;
    }
  }

  async function updateCustomization(customization: AvatarCustomization) {
    await useApi('/avatar/customization', { method: 'PATCH', body: customization });
    await fetchAvatar();
  }

  return { avatar, loading, error, maxStat, xpPercent, fetchAvatar, updateCustomization };
});
```

- [ ] **Étape 2 : Mettre à jour authStore.register() pour accepter la customisation**

Dans `app/stores/auth.ts`, mettre à jour la fonction `register` :

```typescript
async function register(
  pseudo: string,
  email: string,
  password: string,
  customization?: {
    silhouette?: string;
    skinTone?: number;
    hairStyle?: number;
    hairColor?: number;
  },
) {
  const data = await useApi<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { pseudo, email, password, ...customization },
  });
  token.value = data.access_token;
  user.value = await useApi<User>('/users/me', {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
}
```

- [ ] **Étape 3 : Commit**

```bash
git add app/stores/avatar.ts app/stores/auth.ts
git commit -m "feat(avatar): store avatar + updateCustomization, register accepte customisation"
```

---

## Task 10 — Dashboard : remplacer Avatar2D par AvatarCanvas

**Fichiers :**
- Modifier : `questy-web/app/pages/dashboard.vue`

- [ ] **Étape 1 : Remplacer le composant dans le template**

Dans `dashboard.vue`, remplacer :

```html
<!-- Avant -->
<AvatarAvatar2D :hero-class="avatar.heroClass" />

<!-- Après -->
<AvatarAvatarCanvas
  :silhouette="avatar.silhouette"
  :skin-tone="avatar.skinTone"
  :hair-style="avatar.hairStyle"
  :hair-color="avatar.hairColor"
  :hero-class="avatar.heroClass"
/>
```

- [ ] **Étape 2 : Vérifier dans le navigateur**

Ouvrir `/dashboard`. Le canvas doit s'afficher à la place du SVG. Vérifier qu'il se met à jour après une déclaration d'activité (changement de heroClass potentiel).

- [ ] **Étape 3 : Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat(dashboard): remplace Avatar2D par AvatarCanvas pixel art"
```

---

## Task 11 — Profil : section "Modifier mon avatar"

**Fichiers :**
- Modifier : `questy-web/app/pages/profile.vue`

- [ ] **Étape 1 : Ajouter la logique de customisation dans le script**

Dans `<script setup>` de `profile.vue`, ajouter après les refs existants :

```typescript
import type { AvatarCustomization } from '~/types';

const showAvatarEditor = ref(false);
const avatarSaving = ref(false);
const avatarError = ref<string | null>(null);
// Stocke la sélection en cours — l'API n'est appelée qu'au clic "Terminé"
const pendingAvatarCustomization = ref<AvatarCustomization | null>(null);

async function saveAvatarCustomization() {
  if (!pendingAvatarCustomization.value) { showAvatarEditor.value = false; return; }
  avatarSaving.value = true;
  avatarError.value = null;
  try {
    await avatarStore.updateCustomization(pendingAvatarCustomization.value);
    showAvatarEditor.value = false;
  } catch {
    avatarError.value = "Impossible de sauvegarder les modifications.";
  } finally {
    avatarSaving.value = false;
  }
}
```

- [ ] **Étape 2 : Ajouter le bloc avatar dans le template**

Après la section de modification du pseudo/age (chercher le bloc `editMode`), ajouter un nouveau bloc dans le template :

```html
<!-- Section avatar -->
<div class="relative bg-questy-sheet/90 border border-questy-gold/40 p-4 space-y-4">
  <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
  <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
  <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
  <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />

  <div class="flex items-center justify-between">
    <h2 class="text-sm font-bold text-questy-gold uppercase tracking-widest">Mon Avatar</h2>
    <button
      v-if="!showAvatarEditor"
      class="text-xs text-questy-gold/70 underline hover:text-questy-gold"
      @click="showAvatarEditor = true"
    >
      Modifier
    </button>
  </div>

  <div v-if="!showAvatarEditor && avatar" class="flex justify-center">
    <div class="scale-[3] my-6">
      <AvatarAvatarCanvas
        :silhouette="avatar.silhouette"
        :skin-tone="avatar.skinTone"
        :hair-style="avatar.hairStyle"
        :hair-color="avatar.hairColor"
        :hero-class="avatar.heroClass"
      />
    </div>
  </div>

  <div v-if="showAvatarEditor && avatar">
    <AvatarAvatarCustomizer
      :hero-class="avatar.heroClass"
      :initial="{ silhouette: avatar.silhouette, skinTone: avatar.skinTone, hairStyle: avatar.hairStyle, hairColor: avatar.hairColor }"
      @update="(c) => pendingAvatarCustomization = c"
    />
    <p v-if="avatarError" class="text-red-400 text-xs mt-2">{{ avatarError }}</p>
    <div class="flex gap-2 mt-4">
      <button
        class="flex-1 py-2 border border-questy-gold/30 text-questy-light/50 text-xs uppercase tracking-widest hover:border-questy-gold/60"
        @click="showAvatarEditor = false"
      >
        Annuler
      </button>
      <button
        :disabled="avatarSaving"
        class="flex-1 py-2 bg-questy-gold/20 border border-questy-gold text-questy-gold text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        @click="saveAvatarCustomization"
      >
        {{ avatarSaving ? 'Sauvegarde...' : 'Terminé' }}
      </button>
    </div>
  </div>
</div>
```

- [ ] **Étape 3 : Vérifier dans le navigateur**

Ouvrir `/profile`. Cliquer "Modifier", changer la couleur de peau, cliquer "Terminé". Aller sur `/dashboard` et vérifier que l'avatar est mis à jour.

- [ ] **Étape 4 : Commit**

```bash
git add app/pages/profile.vue
git commit -m "feat(profile): section modification avatar avec AvatarCustomizer"
```

---

## Task 12 — Auth : étape 2 customisation à l'inscription

**Fichiers :**
- Modifier : `questy-web/app/pages/auth.vue`

- [ ] **Étape 1 : Ajouter l'état de l'étape 2 dans le script**

Dans `<script setup>` de `auth.vue`, ajouter après les refs existants :

```typescript
import type { AvatarCustomization } from '~/types';

const step = ref<1 | 2>(1);
const pendingCustomization = ref<AvatarCustomization>({
  silhouette: 'A',
  skinTone: 1,
  hairStyle: 1,
  hairColor: 1,
});
// heroClass par défaut pour la preview avant que le vrai avatar soit créé
const previewHeroClass = 'Aventurier';
```

- [ ] **Étape 2 : Modifier la fonction submit pour gérer les 2 étapes**

Remplacer la fonction `submit` existante :

```typescript
async function submit() {
  error.value = null;

  if (mode.value === 'login') {
    try {
      await authStore.login(form.email, form.password);
      navigateTo('/dashboard');
    } catch {
      error.value = 'Email ou mot de passe incorrect.';
    }
    return;
  }

  // Inscription — étape 1 : validation du formulaire
  if (step.value === 1) {
    if (form.password !== form.passwordConfirm) {
      error.value = 'Les mots de passe ne correspondent pas.';
      return;
    }
    step.value = 2;
    return;
  }

  // Inscription — étape 2 : envoi avec customisation
  try {
    await authStore.register(
      form.pseudo,
      form.email,
      form.password,
      pendingCustomization.value,
    );
    navigateTo('/dashboard');
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    step.value = 1;
    error.value = status === 409 ? 'Cet email est déjà utilisé.' : 'Une erreur est survenue.';
  }
}
```

- [ ] **Étape 3 : Ajouter l'étape 2 dans le template**

Dans la section template de `auth.vue`, dans le bloc d'inscription (chercher le `v-if="mode === 'register'"`), ajouter la gestion des étapes. Trouver le bouton de soumission du formulaire d'inscription et ajouter avant le formulaire :

```html
<!-- Indicateur d'étape (visible uniquement en mode register) -->
<div v-if="mode === 'register'" class="flex items-center gap-2 mb-4">
  <div class="flex items-center gap-1">
    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
      :class="step === 1 ? 'bg-questy-gold text-black' : 'bg-questy-gold/30 text-questy-gold'"
    >1</div>
    <span class="text-xs text-questy-light/50">Compte</span>
  </div>
  <div class="flex-1 h-px bg-questy-gold/20" />
  <div class="flex items-center gap-1">
    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
      :class="step === 2 ? 'bg-questy-gold text-black' : 'bg-questy-gold/30 text-questy-gold'"
    >2</div>
    <span class="text-xs text-questy-light/50">Avatar</span>
  </div>
</div>
```

Et remplacer le bloc du formulaire d'inscription pour afficher soit l'étape 1 soit l'étape 2 :

```html
<!-- Étape 2 : customisation avatar -->
<div v-if="mode === 'register' && step === 2">
  <AvatarAvatarCustomizer
    :hero-class="previewHeroClass"
    @update="(c) => pendingCustomization = c"
  />
  <div class="flex gap-2 mt-6">
    <button
      type="button"
      class="flex-1 py-3 border border-questy-gold/30 text-questy-light/50 text-sm uppercase tracking-widest"
      @click="step = 1"
    >
      Retour
    </button>
    <button
      type="button"
      class="flex-1 py-3 bg-questy-gold text-black font-bold text-sm uppercase tracking-widest"
      @click="submit"
    >
      Commencer
    </button>
  </div>
</div>
```

Entourer les champs de formulaire existants (pseudo, email, mdp) dans un `v-if="step === 1"` (ou `v-if="mode === 'login' || step === 1"`).

- [ ] **Étape 4 : Réinitialiser step au changement de mode**

Dans la fonction `switchMode` existante, ajouter :

```typescript
step.value = 1;
```

- [ ] **Étape 5 : Tester le flux complet**

1. Aller sur `/auth`
2. Passer en mode inscription
3. Remplir le formulaire étape 1, cliquer "Suivant"
4. Vérifier que l'étape 2 s'affiche avec le customiseur
5. Modifier l'avatar, cliquer "Commencer"
6. Vérifier l'arrivée sur `/dashboard` avec l'avatar customisé

- [ ] **Étape 6 : Commit**

```bash
git add app/pages/auth.vue
git commit -m "feat(auth): inscription en 2 étapes avec customisation avatar"
```

---

## Vérification finale

- [ ] Backend : `GET /api/avatar/me` retourne les 4 champs de customisation
- [ ] Backend : `PATCH /api/avatar/customization` met à jour les champs
- [ ] Backend : l'inscription avec customisation persiste les valeurs, sans customisation utilise les défauts
- [ ] Frontend : le canvas s'affiche sur le dashboard et reflète les changements de heroClass
- [ ] Frontend : le profil permet de modifier l'avatar et la modification est persistée
- [ ] Frontend : l'inscription en 2 étapes fonctionne avec un passage fluide entre les étapes
- [ ] Frontend : l'annulation de l'étape 2 à l'inscription revient à l'étape 1 sans erreur
