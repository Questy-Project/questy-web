<script setup lang="ts">
import type { Activity } from '~/types';
import type { QuizStartResponse, QuizMessageResponse } from '~/types';

definePageMeta({ middleware: 'auth' });

const activitiesStore = useActivitiesStore();
const avatarStore = useAvatarStore();
const partsStore = usePartsStore();

const showSheet = ref(false);

// Formulaire lecture
const bookTitle      = ref('');
const bookAuthor     = ref('');
const bookVolume     = ref('');
const bookDifficulty = ref<'easy' | 'medium' | 'hard'>('easy');

const isReadingActivity = computed(
  () => activitiesStore.selectedActivity?.category === 'Lecture',
);
const canSubmitReading = computed(
  () => !isReadingActivity.value || (bookTitle.value.trim() !== '' && bookAuthor.value.trim() !== ''),
);

const difficultyOptions: { label: string; value: 'easy' | 'medium' | 'hard'; icon: string }[] = [
  { label: 'Facile',    value: 'easy',   icon: 'sentiment_satisfied' },
  { label: 'Moyen',     value: 'medium', icon: 'sentiment_neutral' },
  { label: 'Difficile', value: 'hard',   icon: 'sentiment_very_dissatisfied' },
];

// Quiz — état
const showQuizModal    = ref(false);
const showResultModal  = ref(false);
const quizSessionId    = ref('');
const chatMessages     = ref<{ role: 'user' | 'model'; text: string }[]>([]);
const userInput        = ref('');
const quizLoading      = ref(false);
const quizError        = ref('');
const quizResult       = ref<{ score: number; xpGained: number; partsUnlocked: number } | null>(null);
const chatContainer    = ref<HTMLElement | null>(null);

// Synchronise l'intensité du store avec la difficulté du quiz pour les activités Lecture
watchEffect(() => {
  if (isReadingActivity.value) {
    activitiesStore.intensity = ({ easy: 1, medium: 1.5, hard: 2 } as Record<string, number>)[bookDifficulty.value] ?? 1;
  }
});

let timer: ReturnType<typeof setTimeout> | null = null;

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});

const durations = [
  { label: '30min', value: 30 },
  { label: '1h', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2h+', value: 120 },
];

const intensities = [
  { label: 'Légère', value: 1, icon: 'directions_walk' },
  { label: 'Modérée', value: 1.5, icon: 'directions_run' },
  { label: 'Intense', value: 2, icon: 'local_fire_department' },
];

const selectedLabel = computed(() => {
  if (activitiesStore.selectedActivity) return activitiesStore.selectedActivity.name;
  if (activitiesStore.customName) return activitiesStore.customName;
  return null;
});

function onSelect(activity: Activity | null, custom: boolean) {
  if (!custom && activity) {
    activitiesStore.selectedActivity = activity;
    activitiesStore.customName = '';
    activitiesStore.customCategory = '';
  }
  showSheet.value = false;
}

async function submit() {
  if (!activitiesStore.canSubmit || !canSubmitReading.value) return;

  if (isReadingActivity.value) {
    // Pour les lectures : démarrer le quiz directement sans logger l'activité
    showQuizModal.value = true;
    quizLoading.value   = true;
    quizError.value     = '';
    try {
      const res = await useApi<QuizStartResponse>('/quiz/start', {
        method: 'POST',
        body: {
          title:        bookTitle.value,
          author:       bookAuthor.value,
          volume:       bookVolume.value || undefined,
          difficulty:   bookDifficulty.value,
          activityName: activitiesStore.selectedActivity!.name,
          activityId:   activitiesStore.selectedActivity!.id,
          duration:     activitiesStore.duration!,
        },
      });
      quizSessionId.value = res.sessionId;
      chatMessages.value  = [{ role: 'model', text: res.message }];
      await nextTick();
      scrollChat();
    } catch {
      quizError.value = 'Le quiz est temporairement indisponible.';
    } finally {
      quizLoading.value = false;
    }
  } else {
    // Pour les autres activités : comportement habituel
    await activitiesStore.logActivity();
    if (activitiesStore.success) {
      timer = setTimeout(() => { activitiesStore.reset(); navigateTo('/dashboard'); }, 2000);
    }
  }
}

async function sendMessage() {
  if (!userInput.value.trim() || quizLoading.value) return;
  const msg = userInput.value.trim();
  userInput.value = '';
  chatMessages.value.push({ role: 'user', text: msg });
  quizLoading.value = true;
  await nextTick();
  scrollChat();

  try {
    const res = await useApi<QuizMessageResponse>('/quiz/message', {
      method: 'POST',
      body: { sessionId: quizSessionId.value, message: msg },
    });
    chatMessages.value.push({ role: 'model', text: res.message });
    await nextTick();
    scrollChat();

    if (res.type === 'score') {
      setTimeout(() => {
        showQuizModal.value   = false;
        quizResult.value      = { score: res.score!, xpGained: res.xpGained!, partsUnlocked: res.partsUnlocked! };
        showResultModal.value = true;
      }, 1500);
    }
  } catch {
    chatMessages.value.push({ role: 'model', text: 'Une erreur est survenue. Réessaie.' });
  } finally {
    quizLoading.value = false;
  }
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/_(.+?)_/gs, '$1');
}

function scrollChat() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

function closeResultAndGoHome() {
  showResultModal.value = false;
  activitiesStore.reset();
  navigateTo('/dashboard');
}
</script>

<template>
  <div
    class="min-h-screen bg-questy-dark text-questy-light pb-20 bg-cover bg-center bg-no-repeat flex flex-col"
    style="font-family: 'Be Vietnam Pro', sans-serif; background-image: linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.50)), url('/images/bg-forest.jpg')"
  >
    <div class="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-4 sm:px-8 space-y-5 sm:space-y-6 py-6 sm:py-12">
      <!-- Header -->
      <header class="border-b border-questy-gold/20 pb-4">
        <h1
          class="text-3xl sm:text-4xl font-bold italic text-questy-gold"
          style="font-family: 'Newsreader', serif"
        >
          Mes Activités
        </h1>
        <p class="text-xs sm:text-sm text-questy-light/50 uppercase tracking-widest mt-1">
          Déclare tes efforts, gagne de l'XP
        </p>
      </header>

      <!-- Succès -->
      <div
        v-if="activitiesStore.success"
        class="relative bg-questy-sheet/90 border border-questy-gold/40 p-5 text-center"
      >
        <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
        <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
        <p class="text-questy-gold font-semibold" style="font-family: 'Newsreader', serif">
          Activité enregistrée !
        </p>
        <p class="text-questy-light/70 text-sm mt-1">
          +{{ activitiesStore.lastLog?.xpGained }} XP · +{{ activitiesStore.lastLog?.partsUnlocked }} <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1; color: #f2ca50">favorite</span>
        </p>
        <p class="text-questy-light/40 text-xs mt-2">Retour au dashboard...</p>
      </div>

      <template v-else>
        <!-- Activité -->
        <div class="space-y-2">
          <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Activité</p>
          <button
            class="w-full flex justify-between items-center bg-questy-sheet/90 border border-questy-gold/40 px-4 py-3 text-sm"
            @click="showSheet = true"
          >
            <span :class="selectedLabel ? 'text-questy-light' : 'text-questy-light/40'">
              {{ selectedLabel ?? 'Choisir une activité...' }}
            </span>
            <span class="text-questy-gold">▼</span>
          </button>
        </div>

        <!-- Formulaire lecture (conditionnel) -->
        <template v-if="isReadingActivity">
          <div class="space-y-2">
            <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Type de lecture</p>
            <div class="w-full bg-questy-sheet/60 border border-questy-gold/20 px-4 py-3 text-sm text-questy-light/60 italic">
              {{ activitiesStore.selectedActivity?.name }}
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Titre du livre</p>
            <input
              v-model="bookTitle"
              type="text"
              placeholder="Ex : Le Seigneur des Anneaux"
              class="w-full bg-questy-sheet/90 border border-questy-gold/40 px-4 py-3 text-sm text-questy-light placeholder:text-questy-light/30 focus:outline-none focus:border-questy-gold"
            />
          </div>
          <div class="space-y-2">
            <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Auteur</p>
            <input
              v-model="bookAuthor"
              type="text"
              placeholder="Ex : J.R.R. Tolkien"
              class="w-full bg-questy-sheet/90 border border-questy-gold/40 px-4 py-3 text-sm text-questy-light placeholder:text-questy-light/30 focus:outline-none focus:border-questy-gold"
            />
          </div>
          <div class="space-y-2">
            <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">
              Tome / Volume <span class="text-questy-light/30 normal-case font-normal">(optionnel)</span>
            </p>
            <input
              v-model="bookVolume"
              type="text"
              placeholder="Ex : Tome 2 — Les Deux Tours"
              class="w-full bg-questy-sheet/90 border border-questy-gold/40 px-4 py-3 text-sm text-questy-light placeholder:text-questy-light/30 focus:outline-none focus:border-questy-gold"
            />
          </div>
          <div class="space-y-2">
            <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Difficulté du quiz</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="d in difficultyOptions"
                :key="d.value"
                class="py-3 border transition-colors text-center"
                :class="bookDifficulty === d.value
                  ? 'bg-questy-gold/20 border-questy-gold'
                  : 'bg-questy-sheet/90 border-questy-gold/20'"
                @click="bookDifficulty = d.value"
              >
                <span class="material-symbols-outlined text-questy-gold text-xl block">{{ d.icon }}</span>
                <div class="text-xs font-semibold mt-1 text-questy-light">{{ d.label }}</div>
              </button>
            </div>
          </div>
        </template>

        <!-- Durée -->
        <div class="space-y-2">
          <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Durée</p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="d in durations"
              :key="d.value"
              class="py-2 text-sm font-medium border transition-colors"
              :class="activitiesStore.duration === d.value
                ? 'bg-questy-gold/20 border-questy-gold text-questy-gold'
                : 'bg-questy-sheet/90 border-questy-gold/20 text-questy-light/60'"
              @click="activitiesStore.duration = d.value"
            >
              {{ d.label }}
            </button>
          </div>
        </div>

        <!-- Intensité (masquée pour les lectures — remplacée par la difficulté du quiz) -->
        <template v-if="!isReadingActivity">
          <div class="space-y-2">
            <p class="text-xs text-questy-gold/70 uppercase tracking-widest font-bold">Intensité</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="i in intensities"
                :key="i.value"
                class="py-3 border transition-colors text-center"
                :class="activitiesStore.intensity === i.value
                  ? 'bg-questy-gold/20 border-questy-gold'
                  : 'bg-questy-sheet/90 border-questy-gold/20'"
                @click="activitiesStore.intensity = i.value"
              >
                <span class="material-symbols-outlined text-questy-gold text-xl block">{{ i.icon }}</span>
                <div class="text-xs font-semibold mt-1">{{ i.label }}</div>
                <div class="text-[10px] text-questy-light/50">×{{ i.value }}</div>
              </button>
            </div>
          </div>
        </template>

        <!-- Aperçu gains -->
        <div
          v-if="!isReadingActivity && activitiesStore.duration && activitiesStore.intensity"
          class="relative bg-questy-sheet/90 border border-questy-gold/40 px-4 py-3"
        >
          <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
          <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
          <p class="text-xs font-bold text-questy-gold mb-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">bolt</span>
            Aperçu des gains
          </p>
          <div class="flex justify-between text-sm">
            <span class="text-questy-gold font-bold">+{{ activitiesStore.xpPreview }} XP</span>
            <span class="text-questy-light/60">+{{ activitiesStore.partsPreview }} <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1; color: #f2ca50">favorite</span></span>
          </div>
        </div>

        <!-- Erreur -->
        <p v-if="activitiesStore.error" class="text-red-400 text-sm text-center">
          {{ activitiesStore.error }}
        </p>

        <!-- CTA -->
        <button
          class="relative w-full overflow-hidden transition-all"
          :class="activitiesStore.canSubmit ? 'active:translate-y-0.5' : 'opacity-40 cursor-not-allowed'"
          :disabled="!activitiesStore.canSubmit || !canSubmitReading || activitiesStore.loading"
          @click="submit"
        >
          <div class="absolute inset-0 bg-gradient-to-b from-questy-gold to-[#d4af37]" />
          <div class="relative px-6 py-4 flex items-center justify-center gap-2 border-b-4 border-[#554300]/40">
            <template v-if="activitiesStore.loading">
              <span class="font-bold text-[#3c2f00] uppercase tracking-widest text-sm">Enregistrement...</span>
            </template>
            <template v-else>
              <span class="material-symbols-outlined text-sm text-[#3c2f00]">swords</span>
              <span class="font-bold text-[#3c2f00] uppercase tracking-widest text-sm">Valider l'activité</span>
            </template>
          </div>
        </button>
      </template>
    </div>

    <ActivitySheet
      v-if="showSheet"
      @select="onSelect"
      @close="showSheet = false"
    />

    <!-- Modale quiz -->
    <div
      v-if="showQuizModal"
      class="fixed inset-0 bg-black/80 z-[100] flex flex-col"
    >
      <div class="flex flex-col h-full max-w-xl mx-auto w-full">
        <!-- Header -->
        <div class="bg-questy-sheet border-b border-questy-gold/40 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <span class="material-symbols-outlined text-questy-gold">quiz</span>
          <div>
            <p class="text-sm font-bold text-questy-gold" style="font-family: 'Newsreader', serif">
              Le Grand Quiz Littéraire
            </p>
            <p class="text-xs text-questy-light/50">{{ bookTitle }} · {{ bookAuthor }}</p>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="chatContainer"
          class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-questy-dark"
        >
          <div
            v-for="(msg, i) in chatMessages"
            :key="i"
            class="flex"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
              :class="msg.role === 'user'
                ? 'bg-questy-gold/20 border border-questy-gold/40 text-questy-light'
                : 'bg-questy-sheet/90 border border-questy-gold/20 text-questy-light'"
            >
              {{ stripMarkdown(msg.text) }}
            </div>
          </div>

          <div v-if="quizLoading" class="flex justify-start">
            <div class="bg-questy-sheet/90 border border-questy-gold/20 px-4 py-3 rounded-xl text-sm text-questy-light/50 italic">
              L'animateur réfléchit...
            </div>
          </div>

          <p v-if="quizError" class="text-center text-red-400 text-sm">{{ quizError }}</p>
        </div>

        <!-- Input -->
        <div class="bg-questy-sheet border-t border-questy-gold/40 px-4 py-3 flex gap-2 flex-shrink-0">
          <input
            v-model="userInput"
            type="text"
            placeholder="Ta réponse..."
            class="flex-1 bg-questy-dark border border-questy-gold/30 px-4 py-2 text-sm text-questy-light placeholder:text-questy-light/30 focus:outline-none focus:border-questy-gold rounded-lg"
            :disabled="quizLoading"
            @keyup.enter="sendMessage"
          />
          <button
            :disabled="quizLoading || !userInput.trim()"
            class="px-4 py-2 bg-questy-gold/20 border border-questy-gold/40 rounded-lg text-questy-gold font-bold text-sm hover:bg-questy-gold/30 transition disabled:opacity-50"
            @click="sendMessage"
          >
            <span class="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modale résultats -->
    <div
      v-if="showResultModal && quizResult"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-questy-sheet border border-questy-gold/40 rounded-xl p-6 w-full max-w-sm text-center">
        <h2
          class="text-2xl font-bold text-questy-gold mb-2"
          style="font-family: 'Newsreader', serif"
        >
          🎉 Quiz terminé !
        </h2>
        <p class="text-4xl font-bold text-questy-light mb-4">{{ quizResult.score }}%</p>

        <div class="space-y-2 mb-6">
          <div class="flex justify-center items-center gap-2 text-sm">
            <span class="material-symbols-outlined text-blue-400">psychology</span>
            <span class="text-questy-light font-bold">+{{ quizResult.xpGained }} XP Intelligence</span>
          </div>
          <div v-if="quizResult.partsUnlocked > 0" class="flex justify-center items-center gap-2 text-sm">
            <span class="material-symbols-outlined text-questy-gold" style="font-variation-settings:'FILL' 1">favorite</span>
            <span class="text-questy-light font-bold">+{{ quizResult.partsUnlocked }} cœur{{ quizResult.partsUnlocked > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <button
          class="w-full py-3 bg-questy-gold/20 border border-questy-gold/40 rounded-lg text-questy-gold font-bold hover:bg-questy-gold/30 transition"
          @click="closeResultAndGoHome"
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>

  </div>
</template>
