<script setup lang="ts">
import { useApi } from '~/composables/useApi';
import { useAvatarStore } from '~/stores/avatar';
import { useAuthStore } from '~/stores/auth';
import type { CombatStart, TurnLog, TurnResult } from '~/types';

const props = defineProps<{ combatData: CombatStart }>();
const emit  = defineEmits<{ result: [won: boolean, pointsGained: number, playerHp: number, opponentHp: number]; }>();

const avatarStore = useAvatarStore();
const authStore   = useAuthStore();

const playerHp   = ref(props.combatData.userHpCurrent ?? props.combatData.userHp);
const opponentHp = ref(props.combatData.opponentHpCurrent ?? props.combatData.opponentHp);
const turnLogs   = ref<TurnLog[]>([]);
const finished   = ref(false);

// idle → resolving (appel API) → animating (dégâts) → result (overlay fin)
const phase = ref<'idle' | 'resolving' | 'animating' | 'result'>('idle');

const playerActionIcon   = ref<string | null>(null);
const opponentActionIcon = ref<string | null>(null);
const blinkPlayer        = ref(false);
const blinkOpponent      = ref(false);
const resultOverlay      = ref<{ won: boolean; pointsGained: number } | null>(null);

onMounted(async () => {
  if (!authStore.user)    await authStore.fetchUser();
  if (!avatarStore.avatar) await avatarStore.fetchAvatar();
});

const ACTION_ICONS: Record<string, string> = {
  PHYSICAL_ATTACK: '⚔️',
  PHYSICAL_BLOCK:  '🛡️',
  MAGIC_ATTACK:    '✨',
  MAGIC_BLOCK:     '🔮',
};

const ACTION_STAT_COLORS: Record<string, string> = {
  PHYSICAL_ATTACK: '#8B0000',
  PHYSICAL_BLOCK:  '#92400E',
  MAGIC_ATTACK:    '#60A5FA',
  MAGIC_BLOCK:     '#F1F5F9',
};

const ACTION_LABELS: Record<string, string> = {
  PHYSICAL_ATTACK: 'Attaque physique',
  PHYSICAL_BLOCK:  'Blocage physique',
  MAGIC_ATTACK:    'Attaque magique',
  MAGIC_BLOCK:     'Blocage magique',
};

const ACTIONS = [
  { key: 'PHYSICAL_ATTACK', label: 'Attaque physique', icon: '/images/icons/icon-power.png' },
  { key: 'PHYSICAL_BLOCK',  label: 'Blocage physique', icon: '/images/icons/icon-stamina.png' },
  { key: 'MAGIC_ATTACK',    label: 'Attaque magique',  icon: '/images/icons/icon-intelligence.png' },
  { key: 'MAGIC_BLOCK',     label: 'Blocage magique',  icon: '/images/icons/icon-spirit.png' },
];

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// Anime le compteur HP de `from` vers `to` en ~600 ms
async function animateHp(target: 'player' | 'opponent', from: number, to: number): Promise<void> {
  const STEPS = 20;
  const stepMs = 600 / STEPS;
  const diff = to - from;
  for (let i = 1; i <= STEPS; i++) {
    await delay(stepMs);
    const val = Math.round(from + (diff * i) / STEPS);
    if (target === 'player') playerHp.value = val;
    else opponentHp.value = val;
  }
}

async function playTurn(action: string) {
  if (phase.value !== 'idle') return;
  phase.value = 'resolving';
  playerActionIcon.value = ACTION_ICONS[action];

  try {
    const res = await useApi<TurnResult>(`/tournament/combat/${props.combatData.combatId}/turn`, {
      method: 'POST',
      body: { action },
    });

    // Afficher l'action adverse puis attendre que le joueur voie les deux icônes
    opponentActionIcon.value = ACTION_ICONS[res.turn.opponentAction];
    await delay(700);

    // Animation dégâts en parallèle
    phase.value = 'animating';
    const tasks: Promise<void>[] = [];

    // playerDamageDealt = dégâts infligés PAR le joueur → l'adversaire clignote
    if (res.turn.playerDamageDealt > 0) {
      blinkOpponent.value = true;
      tasks.push(animateHp('opponent', opponentHp.value, res.opponentHp).then(() => { blinkOpponent.value = false; }));
    } else {
      opponentHp.value = res.opponentHp;
    }

    // opponentDamageDealt = dégâts infligés PAR l'adversaire → le joueur clignote
    if (res.turn.opponentDamageDealt > 0) {
      blinkPlayer.value = true;
      tasks.push(animateHp('player', playerHp.value, res.playerHp).then(() => { blinkPlayer.value = false; }));
    } else {
      playerHp.value = res.playerHp;
    }

    await Promise.all(tasks);
    await delay(300);

    // Effacer les icônes, enregistrer le log
    playerActionIcon.value   = null;
    opponentActionIcon.value = null;
    turnLogs.value.push(res.turn);

    if (res.finished) {
      finished.value  = true;
      resultOverlay.value = { won: res.won ?? false, pointsGained: res.pointsGained ?? 10 };
      phase.value = 'result';
    } else {
      phase.value = 'idle';
    }
  } catch {
    phase.value            = 'idle';
    playerActionIcon.value = null;
    opponentActionIcon.value = null;
  }
}

function confirmResult() {
  if (!resultOverlay.value) return;
  emit('result', resultOverlay.value.won, resultOverlay.value.pointsGained, playerHp.value, opponentHp.value);
}

function hpColor(current: number, max: number): string {
  const pct = max > 0 ? current / max : 0;
  if (pct > 0.5) return '#22c55e';
  if (pct > 0.25) return '#f97316';
  return '#ef4444';
}

function hpPercent(current: number, max: number): number {
  return Math.max((current / max) * 100, 0);
}

const lastLog = computed(() => turnLogs.value[turnLogs.value.length - 1] ?? null);
</script>

<template>
  <div class="flex flex-col gap-3 h-full">

    <!-- ═══ CADRE ARÈNE ═══ -->
    <div
      class="relative rounded-xl border border-questy-gold/40 overflow-hidden flex-1"
      style="background-image: url('/images/bg-arena.png'); background-size: cover; background-position: center bottom;"
    >
      <div class="absolute inset-0 bg-black/40" />

      <!-- ── Barres de HP ── -->
      <div class="relative z-10 grid grid-cols-3 gap-2 px-3 pt-3 pb-2">

        <div class="flex flex-col gap-1">
          <p class="text-xs text-green-300 font-bold truncate">{{ authStore.user?.pseudo ?? 'Toi' }}</p>
          <div class="relative h-2.5 rounded-full bg-black/60 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: hpPercent(playerHp, combatData.userHp) + '%', backgroundColor: hpColor(playerHp, combatData.userHp) }"
            />
          </div>
          <p class="text-[10px] text-gray-300">{{ playerHp }} / {{ combatData.userHp }}</p>
        </div>

        <div class="flex flex-col items-center justify-start pt-0.5">
          <p class="text-questy-gold font-black text-sm tracking-widest">VS</p>
          <p class="text-[10px] text-gray-400 mt-0.5">Tour {{ turnLogs.length }}/10</p>
        </div>

        <div class="flex flex-col gap-1 items-end">
          <p class="text-xs text-red-300 font-bold truncate">{{ combatData.opponentPseudo }}</p>
          <div class="relative w-full h-2.5 rounded-full bg-black/60 overflow-hidden">
            <div
              class="absolute right-0 top-0 h-full rounded-full transition-all duration-500"
              :style="{ width: hpPercent(opponentHp, combatData.opponentHp) + '%', backgroundColor: hpColor(opponentHp, combatData.opponentHp) }"
            />
          </div>
          <p class="text-[10px] text-gray-300 text-right">{{ opponentHp }} / {{ combatData.opponentHp }}</p>
        </div>
      </div>

      <div class="relative z-10 h-px bg-gradient-to-r from-transparent via-questy-gold/40 to-transparent mx-3" />

      <!-- ── Avatar joueur (gauche) ── -->
      <div
        class="absolute left-4 z-10 flex flex-col items-center"
        style="bottom: 17%"
        :class="blinkPlayer ? 'anim-blink' : ''"
      >
        <div v-if="playerActionIcon" class="text-2xl mb-1 drop-shadow-lg animate-bounce">
          {{ playerActionIcon }}
        </div>
        <AvatarCanvas
          v-if="avatarStore.avatar"
          :silhouette="avatarStore.avatar.silhouette"
          :skin-tone="avatarStore.avatar.skinTone"
          :hair-style="avatarStore.avatar.hairStyle"
          :hair-color="avatarStore.avatar.hairColor"
          :hero-class="avatarStore.avatar.heroClass"
          :show-hood="avatarStore.avatar.showHood"
          :display-size="96"
          style="filter: drop-shadow(0 4px 12px rgba(100,200,100,0.5));"
        />
        <div v-else class="w-24 h-24 flex items-center justify-center opacity-40">
          <span class="text-5xl">👤</span>
        </div>
      </div>

      <!-- ── Log combat (centré, au-dessus des avatars) ── -->
      <div v-if="lastLog" class="absolute inset-x-0 z-10 text-center px-4" style="bottom: calc(17% + 104px)">
        <p v-if="lastLog.playerDamageDealt > 0" class="text-green-400 font-bold text-sm drop-shadow-lg">
          ⚡ +{{ lastLog.playerDamageDealt }}
        </p>
        <p v-if="lastLog.opponentDamageDealt > 0" class="text-red-400 font-bold text-sm drop-shadow-lg">
          💢 -{{ lastLog.opponentDamageDealt }}
        </p>
        <p v-if="lastLog.playerCrit || lastLog.opponentCrit" class="text-questy-gold drop-shadow-lg">
          ✨ Critique !
        </p>
      </div>

      <!-- ── Avatar adversaire (droite — miroir) ── -->
      <div
        class="absolute right-4 z-10 flex flex-col items-center"
        style="bottom: 17%; transform: scaleX(-1);"
        :class="blinkOpponent ? 'anim-blink' : ''"
      >
        <!-- L'icône est contre-miroir pour rester lisible -->
        <div v-if="opponentActionIcon" class="text-2xl mb-1 drop-shadow-lg animate-bounce" style="transform: scaleX(-1);">
          {{ opponentActionIcon }}
        </div>
        <AvatarCanvas
          v-if="combatData.opponentAvatar"
          :silhouette="combatData.opponentAvatar.silhouette"
          :skin-tone="combatData.opponentAvatar.skinTone"
          :hair-style="combatData.opponentAvatar.hairStyle"
          :hair-color="combatData.opponentAvatar.hairColor"
          :hero-class="combatData.opponentAvatar.heroClass"
          :show-hood="combatData.opponentAvatar.showHood"
          :display-size="96"
          style="filter: drop-shadow(0 4px 12px rgba(200,80,80,0.5));"
        />
        <div v-else class="w-24 h-24 flex items-center justify-center opacity-40">
          <span class="text-5xl">👤</span>
        </div>
      </div>

      <!-- ── Overlay victoire / défaite ── -->
      <Transition name="result-fade">
        <div
          v-if="resultOverlay"
          class="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer select-none backdrop-blur-sm"
          :class="resultOverlay.won ? 'bg-green-950/85' : 'bg-red-950/85'"
          @click="confirmResult"
        >
          <span class="text-8xl mb-4 drop-shadow-lg">{{ resultOverlay.won ? '🏆' : '💀' }}</span>
          <h2
            class="text-3xl font-black mb-3 drop-shadow-lg tracking-wide"
            :class="resultOverlay.won ? 'text-questy-gold' : 'text-red-300'"
          >
            {{ resultOverlay.won ? 'Victoire !' : 'Défaite...' }}
          </h2>
          <p class="text-xl font-bold text-white mb-6 drop-shadow">+{{ resultOverlay.pointsGained }} pts de tournoi</p>
          <p class="text-sm text-white/60 animate-pulse">Appuie pour continuer</p>
        </div>
      </Transition>
    </div>

    <!-- ── Log du dernier tour ── -->
    <div v-if="lastLog && phase !== 'result'" class="rounded-lg px-3 py-2 bg-gray-900/70 text-xs text-gray-300 space-y-0.5 shrink-0">
      <p>
        Tour {{ lastLog.turn }} —
        Tu utilises <strong class="text-white">{{ ACTION_LABELS[lastLog.playerAction] ?? lastLog.playerAction }}</strong>
        <span v-if="lastLog.playerCrit" class="text-questy-gold"> (CRITIQUE !)</span>
      </p>
      <p>
        {{ combatData.opponentPseudo }} utilise <strong class="text-white">{{ ACTION_LABELS[lastLog.opponentAction] ?? lastLog.opponentAction }}</strong>
        <span v-if="lastLog.opponentCrit" class="text-questy-gold"> (CRITIQUE !)</span>
      </p>
      <p v-if="lastLog.playerDamageDealt > 0" class="text-green-400">Tu infliges {{ lastLog.playerDamageDealt }} dégâts.</p>
      <p v-if="lastLog.opponentDamageDealt > 0" class="text-red-400">Tu subis {{ lastLog.opponentDamageDealt }} dégâts.</p>
    </div>

    <!-- ── Boutons d'action ── -->
    <div v-if="!finished" class="grid grid-cols-2 gap-2 shrink-0">
      <button
        v-for="action in ACTIONS"
        :key="action.key"
        :disabled="phase !== 'idle'"
        class="py-3 rounded-lg font-bold text-sm border-l-4 border border-gray-700/60 bg-gray-900/70 hover:bg-gray-800/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white"
        :style="{
          borderLeftColor: ACTION_STAT_COLORS[action.key],
          boxShadow: `inset 2px 0 12px ${ACTION_STAT_COLORS[action.key]}25`,
        }"
        @click="playTurn(action.key)"
      >
        <img :src="action.icon" :alt="action.label" class="w-5 h-5 object-contain inline-block mr-1.5" />
        {{ action.label }}
      </button>
    </div>

    <p v-if="phase === 'resolving'" class="text-center text-questy-gold/60 animate-pulse text-sm shrink-0">
      Résolution du tour...
    </p>

  </div>
</template>

<style scoped>
@keyframes damage-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.15; }
}
.anim-blink {
  animation: damage-blink 0.15s ease-in-out infinite;
}

.result-fade-enter-active { transition: opacity 0.4s ease; }
.result-fade-leave-active { transition: opacity 0.2s ease; }
.result-fade-enter-from,
.result-fade-leave-to     { opacity: 0; }
</style>
