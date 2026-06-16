<script setup lang="ts">
import type { TodayChallenge } from '~/types';

defineProps<{ challenges: TodayChallenge[] }>();
const emit = defineEmits<{ select: [item: TodayChallenge] }>();
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-3 w-full">
    <ChallengeCard
      v-for="item in challenges"
      :key="item.challenge.id"
      :item="item"
      @select="emit('select', $event)"
    />
  </div>
</template>
