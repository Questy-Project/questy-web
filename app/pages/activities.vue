<script setup lang="ts">
import type { Activity } from '~/types';
import type { QuizStartResponse, QuizMessageResponse } from '~/types';

definePageMeta({ middleware: 'auth' });

const activitiesStore = useActivitiesStore();
const avatarStore = useAvatarStore();
const partsStore = usePartsStore();


// Formulaire lecture
const bookTitle      = ref('');
const bookAuthor     = ref('');
const bookVolume     = ref('');
const isReadingActivity = computed(
  () => activitiesStore.selectedActivity?.category === 'Lecture',
);
const canSubmitReading = computed(
  () => !isReadingActivity.value || (bookTitle.value.trim() !== '' && bookAuthor.value.trim() !== ''),
);

const INTENSITY_TO_DIFFICULTY: Record<number, 'easy' | 'medium' | 'hard'> = {
  1: 'easy', 2: 'medium', 3: 'hard',
};

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
  { label: 'Légère',  value: 1,   img: '/images/icons/intensity-1.png' },
  { label: 'Modérée', value: 1.5, img: '/images/icons/intensity-2.png' },
  { label: 'Intense', value: 2,   img: '/images/icons/intensity-3.png' },
];


function onSelect(activity: Activity | null, custom: boolean) {
  if (!custom && activity) {
    activitiesStore.selectedActivity = activity;
    activitiesStore.customName = '';
    activitiesStore.customCategory = '';
  }
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
          difficulty:   INTENSITY_TO_DIFFICULTY[activitiesStore.intensity] ?? 'easy',
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

async function sendQuickAnswer(answer: string) {
  if (quizLoading.value) return;
  chatMessages.value.push({ role: 'user', text: answer });
  quizLoading.value = true;
  await nextTick();
  scrollChat();
  try {
    const res = await useApi<QuizMessageResponse>('/quiz/message', {
      method: 'POST',
      body: { sessionId: quizSessionId.value, message: answer },
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
    <!-- Header -->
    <header class="w-full px-4 sm:px-8 lg:px-16 pt-6 pb-4 border-b border-questy-gold/20">
      <h1
        class="text-3xl sm:text-4xl lg:text-5xl font-bold italic text-questy-gold flex items-end gap-2"
        style="font-family: 'Newsreader', serif"
      >
        <img src="/images/icons/icon-activities.png" alt="" class="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain" />
        Mes Activités
      </h1>
      <p class="text-xs sm:text-sm lg:text-base text-questy-light/50 uppercase tracking-widest mt-1">
        Déclare tes efforts, gagne de l'XP
      </p>
    </header>

    <!-- Carte formulaire — s'étend sur toute la hauteur disponible -->
    <div class="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
      <div class="bg-questy-sheet/70 backdrop-blur-sm border border-questy-gold/30 rounded-xl p-5 sm:p-8 lg:p-10 flex flex-col max-w-2xl lg:max-w-3xl w-full">

        <!-- Succès -->
        <div
          v-if="activitiesStore.success"
          class="relative border border-questy-gold/40 p-6 text-center my-auto"
        >
          <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
          <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
          <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
          <p class="text-questy-gold font-semibold text-lg" style="font-family: 'Newsreader', serif">Activité enregistrée !</p>
          <p class="text-questy-light/70 text-sm mt-1">
            +{{ activitiesStore.lastLog?.xpGained }} XP · +{{ activitiesStore.lastLog?.partsUnlocked }}
            <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1; color: #f2ca50">favorite</span>
          </p>
          <p class="text-questy-light/40 text-xs mt-2">Retour au dashboard...</p>
        </div>

        <template v-else>
          <div class="flex-1 flex flex-col space-y-6 lg:space-y-8">

            <!-- Catégorie + Activité -->
            <ActivityCombobox @select="onSelect" />

            <!-- Champs lecture -->
            <template v-if="isReadingActivity">
              <div class="space-y-2">
                <p class="text-xs lg:text-sm text-questy-gold/70 uppercase tracking-widest font-bold">Titre du livre</p>
                <input v-model="bookTitle" type="text" placeholder="Ex : Le Seigneur des Anneaux"
                  class="w-full bg-questy-dark/60 border border-questy-gold/40 px-4 py-3 lg:py-4 text-sm lg:text-base text-questy-light placeholder:text-questy-light/30 focus:outline-none focus:border-questy-gold" />
              </div>
              <div class="space-y-2">
                <p class="text-xs lg:text-sm text-questy-gold/70 uppercase tracking-widest font-bold">Auteur</p>
                <input v-model="bookAuthor" type="text" placeholder="Ex : J.R.R. Tolkien"
                  class="w-full bg-questy-dark/60 border border-questy-gold/40 px-4 py-3 lg:py-4 text-sm lg:text-base text-questy-light placeholder:text-questy-light/30 focus:outline-none focus:border-questy-gold" />
              </div>
              <div class="space-y-2">
                <p class="text-xs lg:text-sm text-questy-gold/70 uppercase tracking-widest font-bold">
                  Tome / Volume <span class="text-questy-light/30 normal-case font-normal">(optionnel)</span>
                </p>
                <input v-model="bookVolume" type="text" placeholder="Ex : Tome 2 — Les Deux Tours"
                  class="w-full bg-questy-dark/60 border border-questy-gold/40 px-4 py-3 lg:py-4 text-sm lg:text-base text-questy-light placeholder:text-questy-light/30 focus:outline-none focus:border-questy-gold" />
              </div>
            </template>

            <!-- Durée -->
            <div class="space-y-2">
              <p class="text-xs lg:text-sm text-questy-gold/70 uppercase tracking-widest font-bold">Durée</p>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="d in durations" :key="d.value"
                  class="py-2 lg:py-3 text-sm lg:text-base font-medium border transition-colors"
                  :class="activitiesStore.duration === d.value
                    ? 'bg-questy-gold/20 border-questy-gold text-questy-gold'
                    : 'bg-questy-dark/60 border-questy-gold/20 text-questy-light/60'"
                  @click="activitiesStore.duration = d.value"
                >{{ d.label }}</button>
              </div>
            </div>

            <!-- Intensité / Difficulté -->
            <div class="space-y-2">
              <p class="text-xs lg:text-sm text-questy-gold/70 uppercase tracking-widest font-bold">
                Intensité
              </p>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="i in intensities" :key="i.value" class="flex justify-center transition-all" @click="activitiesStore.intensity = i.value">
                  <img :src="i.img" :alt="i.label" class="w-16 h-16 lg:w-20 lg:h-20 object-contain rounded-full transition-all" :class="activitiesStore.intensity === i.value ? 'opacity-100 scale-110' : 'opacity-40'" />
                </button>
              </div>
            </div>

            <!-- Aperçu gains -->
            <div
              v-if="!isReadingActivity && activitiesStore.duration && activitiesStore.intensity"
              class="relative bg-questy-dark/60 border border-questy-gold/40 px-4 py-3 lg:px-6 lg:py-4"
            >
              <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
              <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
              <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
              <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
              <p class="text-xs lg:text-sm font-bold text-questy-gold mb-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">bolt</span> Aperçu des gains
              </p>
              <div class="flex justify-between text-sm lg:text-base">
                <span class="text-questy-gold font-bold">+{{ activitiesStore.xpPreview }} XP</span>
                <span class="text-questy-light/60">+{{ activitiesStore.partsPreview }} <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1; color: #f2ca50">favorite</span></span>
              </div>
            </div>

            <p v-if="activitiesStore.error" class="text-red-400 text-sm text-center">{{ activitiesStore.error }}</p>

            <!-- CTA -->
            <div>
              <button
                class="relative w-full overflow-hidden transition-all"
                :class="activitiesStore.canSubmit ? 'active:translate-y-0.5' : 'opacity-40 cursor-not-allowed'"
                :disabled="!activitiesStore.canSubmit || !canSubmitReading || activitiesStore.loading"
                @click="submit"
              >
                <div class="absolute inset-0 bg-gradient-to-b from-questy-gold to-[#d4af37]" />
                <div class="relative px-6 py-4 lg:py-5 flex items-center justify-center gap-2 border-b-4 border-[#554300]/40">
                  <template v-if="activitiesStore.loading">
                    <span class="font-bold text-[#3c2f00] uppercase tracking-widest text-sm lg:text-base">Enregistrement...</span>
                  </template>
                  <template v-else>
                    <span class="material-symbols-outlined text-sm lg:text-base text-[#3c2f00]">swords</span>
                    <span class="font-bold text-[#3c2f00] uppercase tracking-widest text-sm lg:text-base">Valider l'activité</span>
                  </template>
                </div>
              </button>
            </div>

          </div>
        </template>
      </div>
    </div>

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
        <div class="bg-questy-sheet border-t border-questy-gold/40 px-4 py-3 flex-shrink-0">
          <!-- Mode facile : boutons Vrai / Faux -->
          <div v-if="bookDifficulty === 'easy'" class="flex gap-3">
            <button
              v-for="choice in ['Vrai', 'Faux']"
              :key="choice"
              :disabled="quizLoading"
              class="flex-1 py-3 border rounded-lg font-bold text-sm transition disabled:opacity-50"
              :class="choice === 'Vrai'
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/40'
                : 'bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/40'"
              @click="sendQuickAnswer(choice)"
            >
              {{ choice }}
            </button>
          </div>

          <!-- Mode moyen : boutons A / B / C / D -->
          <div v-else-if="bookDifficulty === 'medium'" class="grid grid-cols-4 gap-2">
            <button
              v-for="choice in ['A', 'B', 'C', 'D']"
              :key="choice"
              :disabled="quizLoading"
              class="py-3 border border-questy-gold/40 rounded-lg bg-questy-gold/10 text-questy-gold font-bold text-sm hover:bg-questy-gold/25 transition disabled:opacity-50"
              @click="sendQuickAnswer(choice)"
            >
              {{ choice }}
            </button>
          </div>

          <!-- Mode difficile : saisie libre -->
          <div v-else class="flex gap-2">
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
            <span class="material-symbols-outlined text-red-500" style="font-variation-settings:'FILL' 1">favorite</span>
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
