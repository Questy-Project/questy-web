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
const HAIR_COLORS = ['#8B5E3C', '#C8A96E', '#B03A2E', '#555555'];

function prevStyle() {
  hairStyle.value = hairStyle.value === 1 ? 20 : hairStyle.value - 1;
}
function nextStyle() {
  hairStyle.value = hairStyle.value === 20 ? 1 : hairStyle.value + 1;
}

function emitUpdate() {
  emit('update', {
    silhouette: silhouette.value,
    skinTone: skinTone.value,
    hairStyle: hairStyle.value,
    hairColor: hairColor.value,
  });
}

watch([silhouette, skinTone, hairStyle, hairColor], emitUpdate);
</script>

<template>
  <div class="flex flex-col items-center gap-5 w-full">

    <!-- Preview live — conteneur 192px = 64×3 pour que le cadre englobe le canvas zoomé -->
    <div class="w-48 h-48 flex items-center justify-center border border-questy-gold/40 bg-questy-sheet/60">
      <div class="scale-[3]">
        <AvatarCanvas
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
      <div class="flex gap-2">
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
      <div class="flex gap-3">
        <button
          v-for="(color, i) in SKIN_COLORS"
          :key="i"
          class="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110"
          :class="skinTone === i + 1 ? 'border-questy-gold scale-110' : 'border-white/20'"
          :style="{ backgroundColor: color }"
          @click="skinTone = i + 1"
        />
      </div>
    </div>

    <!-- Coiffure -->
    <div class="w-full space-y-2">
      <p class="text-xs text-questy-gold/70 uppercase tracking-widest">Coiffure</p>
      <div class="flex items-center gap-2">
        <button
          class="w-10 h-10 border border-questy-gold/30 text-questy-gold text-lg hover:border-questy-gold hover:bg-questy-gold/10 transition-colors"
          @click="prevStyle"
        >←</button>
        <div class="flex-1 flex items-center justify-center border border-questy-gold/20 h-10 bg-questy-sheet/40">
          <span class="text-sm text-questy-light font-bold tracking-wider">Style {{ hairStyle }}</span>
        </div>
        <button
          class="w-10 h-10 border border-questy-gold/30 text-questy-gold text-lg hover:border-questy-gold hover:bg-questy-gold/10 transition-colors"
          @click="nextStyle"
        >→</button>
      </div>
    </div>

    <!-- Couleur des cheveux -->
    <div class="w-full space-y-2">
      <p class="text-xs text-questy-gold/70 uppercase tracking-widest">Couleur des cheveux</p>
      <div class="flex gap-3">
        <button
          v-for="(color, i) in HAIR_COLORS"
          :key="i"
          class="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110"
          :class="hairColor === i + 1 ? 'border-questy-gold scale-110' : 'border-white/20'"
          :style="{ backgroundColor: color }"
          @click="hairColor = i + 1"
        />
      </div>
    </div>

  </div>
</template>
