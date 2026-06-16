<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: number;
  maxValue: number;
  align?: 'left' | 'right';
  description?: string;
  large?: boolean;
  color?: string;
}>();

const width    = computed(() => props.maxValue > 0 ? Math.round((props.value / props.maxValue) * 100) : 0);
const isRight  = computed(() => props.align === 'right');
const barColor = computed(() => props.color ?? '#f2ca50');

// Dégradé qui s'estompe vers le bout libre de la barre (sens visuellement naturel)
const gradient = computed(() => {
  const c = barColor.value;
  return isRight.value
    ? `linear-gradient(90deg, ${c}, ${c}88)`   // RTL : plein à gauche (ancre avatar), estompé à droite
    : `linear-gradient(90deg, ${c}88, ${c})`;  // LTR : estompé à gauche, plein à droite (ancre avatar)
});
</script>

<template>
  <div>
    <!-- Label + valeur -->
    <div
      class="flex mb-1.5"
      :class="[large ? 'text-sm lg:text-base' : 'text-xs', isRight ? 'flex-row-reverse' : '']"
    >
      <span class="text-questy-light/80 flex-1" :class="isRight ? 'text-right' : ''">{{ label }}</span>
      <span
        class="font-bold tabular-nums"
        :class="isRight ? 'mr-2' : 'ml-2'"
        :style="{ color: barColor }"
      >
        {{ value.toLocaleString('fr-FR') }}
      </span>
    </div>

    <!-- Piste -->
    <div
      class="flex overflow-hidden rounded-full bg-questy-dark/60"
      :class="large ? 'h-3 lg:h-4' : 'h-1.5'"
      style="box-shadow: inset 0 1px 3px rgba(0,0,0,0.6);"
    >
      <!-- Spacer pour les barres RTL (côté gauche) -->
      <div v-if="isRight" class="flex-1" />

      <!-- Barre de progression -->
      <div
        class="relative overflow-hidden rounded-full transition-all duration-700"
        :style="{ width: `${width}%`, background: gradient }"
      >
        <!-- Reflet (ligne lumineuse en haut) -->
        <div class="absolute inset-x-0 top-0 h-1/2 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
      </div>

      <!-- Spacer pour les barres LTR (côté droit) -->
      <div v-if="!isRight" class="flex-1" />
    </div>

    <p v-if="description" class="text-xs text-questy-light/40 mt-0.5">{{ description }}</p>
  </div>
</template>
