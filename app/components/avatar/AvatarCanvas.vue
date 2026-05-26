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
const hasRendered = ref(false);

function drawPlaceholder(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = '#c8a87a';
  ctx.beginPath();
  ctx.arc(32, 14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(18, 24, 28, 24);
  ctx.fillRect(8, 24, 10, 20);
  ctx.fillRect(46, 24, 10, 20);
  ctx.fillRect(18, 48, 12, 16);
  ctx.fillRect(34, 48, 12, 16);
  ctx.fillStyle = '#5a3e2b';
  ctx.fillRect(18, 28, 28, 20);
}

async function draw() {
  const el = canvas.value;
  if (!el) return;
  const ctx = el.getContext('2d');
  if (!ctx) return;

  // Placeholder uniquement au premier chargement — évite le clignotement lors des mises à jour
  if (!hasRendered.value) drawPlaceholder(ctx);

  const layers = await useAvatarAssets(
    props.silhouette,
    props.skinTone,
    props.hairStyle,
    props.hairColor,
    props.heroClass,
  );

  const order = [
    layers.body, layers.hair,
    layers.outfitLegs, layers.outfitTorso, layers.outfitHead,
    layers.armorLegs, layers.armorTorso, layers.armorHead,
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
  () => [props.silhouette, props.skinTone, props.hairStyle, props.hairColor, props.heroClass],
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
  <canvas
    ref="canvas"
    width="64"
    height="64"
    class="block"
    style="image-rendering: pixelated; image-rendering: crisp-edges;"
  />
</template>
