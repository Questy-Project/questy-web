<script setup lang="ts">
import type { TodayChallenge } from '~/types';
import { useApi } from '~/composables/useApi';

const props = defineProps<{ item: TodayChallenge; color: string }>();
const emit  = defineEmits<{ result: [success: boolean]; abandon: [sessionId: string | null]; 'session-started': [sessionId: string] }>();

const messages  = ref<{ role: string; content: string }[]>([]);
const sessionId = ref<string | null>(null);
const loading   = ref(false);
const started   = ref(false);
const userInput = ref('');
const isQuiz    = computed(() => props.item.challenge.type === 'QUIZ_IA');

const lastAssistantMessage = computed(() =>
  [...messages.value].reverse().find(m => m.role === 'assistant')?.content ?? ''
);

const MSGS_QUIZ = [
  "L'oracle consulte ses archives...",
  "Le savant prépare sa question...",
  "Les parchemins s'illuminent...",
  "L'encyclopédie se feuillette...",
];
const MSGS_SPIRIT = [
  "Le maître d'énigmes médite...",
  "Les ombres murmurent entre elles...",
  "Le voile se lève lentement...",
  "Le grimoire révèle ses secrets...",
];

const msgIndex = ref(0);
let msgTimer: ReturnType<typeof setInterval> | null = null;

const loadingMsg = computed(() => {
  const msgs = isQuiz.value ? MSGS_QUIZ : MSGS_SPIRIT;
  return msgs[msgIndex.value % msgs.length];
});

watch(loading, (val) => {
  if (val) {
    msgIndex.value = 0;
    msgTimer = setInterval(() => msgIndex.value++, 2200);
  } else {
    if (msgTimer) { clearInterval(msgTimer); msgTimer = null; }
  }
});

onUnmounted(() => { if (msgTimer) clearInterval(msgTimer); });

async function start() {
  loading.value = true;
  try {
    const res = await useApi<{ sessionId: string; message: string }>('/challenges/ia/start', {
      method: 'POST',
      body: { stat: props.item.challenge.stat },
    });
    sessionId.value = res.sessionId;
    emit('session-started', res.sessionId);
    messages.value.push({ role: 'assistant', content: res.message });
    started.value = true;
  } finally {
    loading.value = false;
  }
}

async function sendAnswer(answer: string) {
  if (!sessionId.value || loading.value || !answer.trim()) return;
  messages.value.push({ role: 'user', content: answer });
  userInput.value = '';
  loading.value = true;
  try {
    const res = await useApi<{ type: string; message: string; success?: boolean }>('/challenges/ia/message', {
      method: 'POST',
      body: { sessionId: sessionId.value, message: answer },
    });
    messages.value.push({ role: 'assistant', content: res.message });
    if (res.type === 'result') {
      await new Promise(resolve => setTimeout(resolve, 2500));
      emit('result', res.success ?? false);
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Écran de départ -->
    <template v-if="!started">
      <div class="rounded-lg p-4 md:p-6" :style="{ background: '#1e1e2e', border: `1px solid ${color}33` }">
        <p class="text-xs md:text-sm text-questy-gold uppercase tracking-widest mb-2">Défi du jour</p>
        <p class="text-base md:text-xl font-bold text-white mb-1">{{ item.challenge.title }}</p>
        <p class="text-sm md:text-base text-gray-400">{{ item.challenge.description }}</p>
      </div>

      <!-- Loader démarrage -->
      <div v-if="loading" class="flex flex-col items-center gap-3 py-4">
        <span class="text-4xl md:text-6xl animate-pulse">{{ isQuiz ? '🧠' : '🔮' }}</span>
        <p class="text-sm md:text-base transition-all duration-500" :style="{ color }">{{ loadingMsg }}</p>
        <div class="flex gap-2">
          <span v-for="i in 3" :key="i" class="loading-dot w-2.5 h-2.5 rounded-full"
            :style="{ background: color, animationDelay: `${(i - 1) * 220}ms` }"
          />
        </div>
      </div>
      <UiRpgButton v-else :color="color" class="w-full" @click="start">
        ⚔️ Commencer le défi
      </UiRpgButton>
    </template>

    <!-- Défi en cours -->
    <template v-else>
      <div
        class="max-h-64 md:max-h-96 rounded-lg p-3 md:p-5 text-sm md:text-base text-gray-200 whitespace-pre-wrap overflow-y-auto"
        :style="{ background: '#1e1e2e', border: `1px solid ${color}33` }"
      >{{ lastAssistantMessage }}</div>

      <!-- Loader réponse IA -->
      <div v-if="loading" class="flex flex-col items-center gap-3 py-3">
        <span class="text-3xl md:text-5xl animate-pulse">{{ isQuiz ? '🧠' : '🔮' }}</span>
        <p class="text-sm md:text-base transition-all duration-500" :style="{ color }">{{ loadingMsg }}</p>
        <div class="flex gap-2">
          <span v-for="i in 3" :key="i" class="loading-dot w-2.5 h-2.5 rounded-full"
            :style="{ background: color, animationDelay: `${(i - 1) * 220}ms` }"
          />
        </div>
      </div>

      <template v-else>
        <!-- Boutons A/B/C/D pour quiz culture G -->
        <div v-if="isQuiz" class="grid grid-cols-2 gap-2">
          <button
            v-for="opt in ['A', 'B', 'C', 'D']"
            :key="opt"
            class="py-2 md:py-3 rounded-lg text-sm md:text-base font-bold bg-gray-800 text-gray-200 border border-gray-600
                   hover:bg-gray-700 hover:border-gray-500 transition-all"
            @click="sendAnswer(opt)"
          >{{ opt }}</button>
        </div>

        <!-- Champ libre pour énigmes -->
        <div v-else class="flex gap-2">
          <input
            v-model="userInput"
            class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 md:py-3 text-sm md:text-base text-white"
            placeholder="Ta réponse..."
            @keydown.enter="sendAnswer(userInput)"
          />
          <UiRpgButton :color="color" :disabled="!userInput.trim()" @click="sendAnswer(userInput)">📜</UiRpgButton>
        </div>
      </template>

      <button class="text-sm text-gray-500 hover:text-gray-300 transition-colors" :disabled="loading" @click="emit('abandon', sessionId)">🏳️ Abandonner</button>
    </template>
  </div>
</template>

<style scoped>
@keyframes dot-bounce {
  0%, 100% { transform: translateY(0);   opacity: 0.3; }
  50%       { transform: translateY(-7px); opacity: 1;   }
}
.loading-dot {
  animation: dot-bounce 1.3s ease-in-out infinite;
}
</style>
