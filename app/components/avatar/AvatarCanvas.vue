<script setup lang="ts">
import { useAvatarAssets } from '~/composables/useAvatarAssets';

const props = defineProps<{
  silhouette: string;
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  heroClass: string;
  showHood?: boolean;
  displaySize?: number; // taille d'affichage CSS en px — le canvas reste 64×64 en résolution
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const hasRendered = ref(false);
const px = computed(() => props.displaySize ?? 64);

async function draw() {
  const el = canvas.value;
  if (!el) return;
  const ctx = el.getContext('2d');
  if (!ctx) return;

  const layers = await useAvatarAssets(
    props.silhouette,
    props.skinTone,
    props.hairStyle,
    props.hairColor,
    props.heroClass,
    props.showHood ?? false,
  );

  const order = [
    layers.body, layers.hair,
    layers.boots,
    layers.outfitLegs, layers.outfitTorso, layers.outfitHead,
    layers.armorTorso, layers.armorHead,
    layers.weapon,
  ];

  const anyLoaded = order.some(img => img !== null);
  if (!anyLoaded) return;

  ctx.clearRect(0, 0, 64, 64);
  for (const img of order) {
    if (img) ctx.drawImage(img, 0, 0, 64, 64);
  }

  hasRendered.value = true;
}

watch(
  () => [props.silhouette, props.skinTone, props.hairStyle, props.hairColor, props.heroClass, props.showHood],
  () => draw(),
  { immediate: false },
);

watch(canvas, (el) => { if (el) draw(); }, { immediate: true });

onMounted(async () => {
  await nextTick();
  draw();
});
</script>

<template>
  <div class="relative" :style="{ width: px + 'px', height: px + 'px' }">

    <!-- Loading RPG — affiché uniquement avant le premier rendu des assets -->
    <div
      v-if="!hasRendered"
      class="absolute inset-0 flex flex-col items-center justify-center gap-1"
    >
      <span class="text-xl animate-bounce">⚔️</span>
      <div class="w-8 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div class="h-full bg-questy-gold rounded-full animate-loading-bar" />
      </div>
    </div>

    <canvas
      ref="canvas"
      width="64"
      height="64"
      class="block"
      :class="hasRendered ? 'opacity-100' : 'opacity-0'"
      :style="`width: ${px}px; height: ${px}px; image-rendering: pixelated; image-rendering: crisp-edges;`"
    />

  </div>
</template>
