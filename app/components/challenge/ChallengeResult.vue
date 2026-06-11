<script setup lang="ts">
defineProps<{ success: boolean; statLabel: string; color: string; monthlyBonus: number }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 py-8 md:py-16">
    <span class="text-7xl md:text-9xl drop-shadow-lg">{{ success ? '🏆' : '💀' }}</span>

    <div class="text-center">
      <p class="text-2xl md:text-4xl font-bold" :style="{ color: success ? color : '#ef4444' }">
        {{ success ? 'Défi relevé !' : 'Défi échoué' }}
      </p>
      <p v-if="success" class="text-sm md:text-lg text-questy-light/70 mt-2">
        +1 <span class="font-bold" :style="{ color }">{{ statLabel }}</span> ce mois ·
        <span class="text-questy-light/50">{{ monthlyBonus }}/15</span>
      </p>
      <p v-else class="text-sm md:text-lg text-questy-light/60 mt-2">
        Les cœurs ont été consommés.<br />Réessaie demain !
      </p>
    </div>

    <UiRpgButton :color="success ? color : '#ef4444'" class="w-40 md:w-56" @click="emit('close')">
      {{ success ? '🏆 Continuer' : '🔙 Retour' }}
    </UiRpgButton>
  </div>
</template>
