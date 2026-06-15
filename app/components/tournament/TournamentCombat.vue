<script setup lang="ts">
import { useApi } from '~/composables/useApi';
import type { CombatStart, TurnLog, TurnResult } from '~/types';

const props = defineProps<{ combatData: CombatStart }>();
const emit  = defineEmits<{ result: [won: boolean, pointsGained: number]; }>();

const playerHp   = ref(props.combatData.userHp);
const opponentHp = ref(props.combatData.opponentHp);
const turnLogs   = ref<TurnLog[]>([]);
const loading    = ref(false);
const finished   = ref(false);

const ACTIONS = [
  { key: 'PHYSICAL_ATTACK', label: '⚔️ Attaque physique' },
  { key: 'PHYSICAL_BLOCK',  label: '🛡️ Blocage physique' },
  { key: 'MAGIC_ATTACK',    label: '✨ Attaque magique'  },
  { key: 'MAGIC_BLOCK',     label: '🔮 Blocage magique'  },
];

async function playTurn(action: string) {
  if (loading.value || finished.value) return;
  loading.value = true;
  try {
    const res = await useApi<TurnResult>(`/tournament/combat/${props.combatData.combatId}/turn`, {
      method: 'POST',
      body: { action },
    });
    turnLogs.value.push(res.turn);
    playerHp.value   = res.playerHp;
    opponentHp.value = res.opponentHp;
    if (res.finished) {
      finished.value = true;
      emit('result', res.won ?? false, res.pointsGained ?? 10);
    }
  } finally {
    loading.value = false;
  }
}

function hpPercent(current: number, start: number): number {
  return Math.max((current / start) * 100, 0);
}

const lastLog = computed(() => turnLogs.value[turnLogs.value.length - 1] ?? null);
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Barres de HP -->
    <div class="flex flex-col gap-2">
      <div>
        <p class="text-xs text-questy-gold mb-1">Toi — {{ playerHp }} HP</p>
        <div class="h-3 rounded-full bg-gray-700">
          <div class="h-3 rounded-full bg-green-500 transition-all duration-500"
            :style="{ width: hpPercent(playerHp, combatData.userHp) + '%' }" />
        </div>
      </div>
      <div>
        <p class="text-xs text-red-400 mb-1">{{ combatData.opponentPseudo }} — {{ opponentHp }} HP</p>
        <div class="h-3 rounded-full bg-gray-700">
          <div class="h-3 rounded-full bg-red-500 transition-all duration-500"
            :style="{ width: hpPercent(opponentHp, combatData.opponentHp) + '%' }" />
        </div>
      </div>
    </div>

    <!-- Log du dernier tour -->
    <div v-if="lastLog" class="rounded-lg p-3 bg-gray-800/60 text-sm text-gray-300 space-y-1">
      <p>Tour {{ lastLog.turn }} — Tu utilises <strong>{{ lastLog.playerAction }}</strong>{{ lastLog.playerCrit ? ' (CRITIQUE !)' : '' }}</p>
      <p>{{ combatData.opponentPseudo }} utilise <strong>{{ lastLog.opponentAction }}</strong>{{ lastLog.opponentCrit ? ' (CRITIQUE !)' : '' }}</p>
      <p v-if="lastLog.playerDamageDealt > 0" class="text-green-400">Tu inflige {{ lastLog.playerDamageDealt }} dégâts.</p>
      <p v-if="lastLog.opponentDamageDealt > 0" class="text-red-400">Tu subis {{ lastLog.opponentDamageDealt }} dégâts.</p>
    </div>

    <!-- Actions -->
    <div v-if="!finished" class="grid grid-cols-2 gap-2">
      <button
        v-for="action in ACTIONS"
        :key="action.key"
        :disabled="loading"
        class="py-3 rounded-lg font-bold text-sm bg-gray-800 border border-gray-600
               hover:bg-gray-700 hover:border-questy-gold transition-all disabled:opacity-50"
        @click="playTurn(action.key)"
      >
        {{ action.label }}
      </button>
    </div>

    <p v-if="loading" class="text-center text-questy-gold/60 animate-pulse text-sm">Résolution du tour...</p>
  </div>
</template>
