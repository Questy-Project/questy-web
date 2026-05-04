<script setup lang="ts">
import type { ActivityLog } from "~/types";

definePageMeta({ middleware: "auth" });

const avatarStore = useAvatarStore();
const authStore = useAuthStore();
const activitiesStore = useActivitiesStore();

const editMode = ref(false);
const editPseudo = ref("");
const editAge = ref<number | null>(null);
const editError = ref<string | null>(null);
const editLoading = ref(false);

const avatar = computed(() => avatarStore.avatar);
const maxStat = computed(() => avatarStore.maxStat);
const user = computed(() => authStore.user);
const xpPercent = computed(() => avatarStore.xpPercent);

const stats = [
  { key: "strength" as const, label: "Force", description: "Attaque physique", color: "#8B0000" },
  { key: "agility" as const, label: "Agilité", description: "Esquive & vitesse", color: "#EAB308" },
  { key: "endurance" as const, label: "Endurance", description: "Résistance aux dégâts", color: "#92400E" },
  { key: "intelligence" as const, label: "Intelligence", description: "Puissance magique", color: "#60A5FA" },
  { key: "spirit" as const, label: "Esprit", description: "Soins & soutien", color: "#F1F5F9" },
  { key: "vitality" as const, label: "Vitalité", description: "Points de vie max", color: "#F472B6" },
];

function startEdit() {
  editPseudo.value = user.value?.pseudo ?? "";
  editAge.value = user.value?.age ?? null;
  editError.value = null;
  editMode.value = true;
}

function cancelEdit() {
  editMode.value = false;
  editError.value = null;
}

async function saveEdit() {
  editLoading.value = true;
  editError.value = null;
  try {
    await authStore.updateProfile(editPseudo.value, editAge.value);
    editMode.value = false;
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    editError.value = err?.data?.message ?? "Erreur lors de la sauvegarde.";
  } finally {
    editLoading.value = false;
  }
}

function logout() {
  authStore.logout();
  navigateTo("/auth");
}

function logDisplayName(log: ActivityLog): string {
  return log.customName ?? log.activity?.name ?? "Activité";
}

function logRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
}

onMounted(async () => {
  if (!authStore.user) await authStore.fetchUser();
  if (!avatarStore.avatar) await avatarStore.fetchAvatar();
  await activitiesStore.fetchRecentLogs();
});
</script>

<template>
  <div
    class="min-h-screen bg-questy-dark text-questy-light pb-24 bg-cover bg-center bg-no-repeat"
    style="font-family: 'Be Vietnam Pro', sans-serif; background-image: linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.50)), url('/images/bg-library.jpg')"
  >
    <div class="max-w-xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-10 space-y-5 sm:space-y-6">
      <!-- Header -->
      <header class="border-b border-questy-gold/20 pb-4">
        <h1
          class="text-3xl sm:text-4xl font-bold italic text-questy-gold"
          style="font-family: 'Newsreader', serif"
        >
          Mon Profil
        </h1>
        <p class="text-xs sm:text-sm text-questy-light/50 uppercase tracking-widest mt-1">
          {{ user?.pseudo }} · {{ avatar?.heroClass ?? 'Aventurier' }}
        </p>
      </header>

      <!-- Bloc 1 : Portrait avatar -->
      <div
        v-if="avatar"
        class="relative bg-questy-sheet/90 border border-questy-gold/40 p-5 flex flex-col items-center gap-3"
      >
        <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
        <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
        <div class="text-xs text-questy-gold/50 uppercase tracking-widest font-bold">Portrait du Héros</div>
        <AvatarAvatar2D :hero-class="avatar.heroClass" />
        <AvatarHeroClass :hero-class="avatar.heroClass" />
        <p class="text-xs text-questy-light/50">Niveau {{ avatar.level }}</p>
        <div class="w-full">
          <div class="flex justify-between text-xs text-questy-light/50 mb-1">
            <span>XP</span>
            <span>{{ avatar.xp }} / {{ avatar.xpNextLevel }}</span>
          </div>
          <div class="bg-questy-dark rounded-full h-2">
            <div
              class="h-full rounded-full bg-questy-purple transition-all duration-500"
              :style="{ width: `${xpPercent}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Bloc 2 : Stats -->
      <div
        v-if="avatar"
        class="relative bg-questy-sheet/90 border border-questy-gold/40 p-4"
      >
        <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
        <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="h-0.5 w-4 bg-questy-gold" />
            <h2
              class="text-sm font-bold italic text-questy-gold"
              style="font-family: 'Newsreader', serif"
            >
              Statistiques
            </h2>
          </div>
          <AvatarStatBar
            v-for="stat in stats"
            :key="stat.key"
            :label="stat.label"
            :value="(avatar[stat.key] as number)"
            :max-value="maxStat"
            :description="stat.description"
            :color="stat.color"
          />
        </div>
      </div>

      <!-- Bloc 3 : Historique -->
      <div class="relative bg-questy-sheet/90 border border-questy-gold/40 p-4">
        <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
        <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
        <div class="flex items-center gap-2 mb-4">
          <div class="h-0.5 w-4 bg-questy-gold" />
          <h2
            class="text-sm font-bold italic text-questy-gold"
            style="font-family: 'Newsreader', serif"
          >
            Dernières activités
          </h2>
        </div>
        <p
          v-if="activitiesStore.recentLogs.length === 0"
          class="text-sm text-questy-light/40 text-center py-4"
        >
          Aucune activité déclarée pour le moment.
        </p>
        <ul v-else class="space-y-3">
          <li
            v-for="log in activitiesStore.recentLogs"
            :key="log.id"
            class="flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-medium">{{ logDisplayName(log) }}</p>
              <p class="text-xs text-questy-light/40">
                {{ log.duration }} min · {{ logRelativeDate(log.loggedAt) }}
              </p>
            </div>
            <span class="text-xs font-bold text-questy-gold">+{{ log.xpGained }} XP</span>
          </li>
        </ul>
      </div>

      <!-- Bloc 4 : Paramètres -->
      <div class="relative bg-questy-sheet/90 border border-questy-gold/40 p-4">
        <span class="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-2 border-l-2 border-questy-gold" />
        <span class="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-2 border-r-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-2 border-l-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-2 border-r-2 border-questy-gold" />
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="h-0.5 w-4 bg-questy-gold" />
            <h2
              class="text-sm font-bold italic text-questy-gold"
              style="font-family: 'Newsreader', serif"
            >
              Paramètres
            </h2>
          </div>

          <!-- Mode lecture -->
          <template v-if="!editMode">
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-questy-light/60">Pseudo</span>
                <span>{{ user?.pseudo }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-questy-light/60">Âge</span>
                <span>{{ user?.age ? `${user.age} ans` : "Non renseigné" }}</span>
              </div>
            </div>
            <button
              class="w-full py-3 border border-questy-gold/40 text-sm text-questy-gold hover:bg-questy-gold/10 transition-colors flex items-center justify-center gap-2"
              @click="startEdit"
            >
              <span class="material-symbols-outlined text-base leading-none">edit</span>
              Modifier mes informations
            </button>
          </template>

          <!-- Mode édition -->
          <template v-else>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-questy-light/60 mb-1 block">Pseudo</label>
                <input
                  v-model="editPseudo"
                  type="text"
                  class="w-full bg-questy-dark text-questy-light border border-questy-gold/30 px-4 py-3 text-sm outline-none focus:border-questy-gold"
                />
              </div>
              <div>
                <label class="text-xs text-questy-light/60 mb-1 block">Âge</label>
                <input
                  v-model.number="editAge"
                  type="number"
                  min="1"
                  max="120"
                  class="w-full bg-questy-dark text-questy-light border border-questy-gold/30 px-4 py-3 text-sm outline-none focus:border-questy-gold"
                />
              </div>
              <p v-if="editError" class="text-xs text-red-400">{{ editError }}</p>
              <div class="grid grid-cols-2 gap-3">
                <button
                  class="py-3 border border-questy-gold/40 text-sm text-questy-gold"
                  @click="cancelEdit"
                >
                  Annuler
                </button>
                <button
                  class="relative overflow-hidden active:translate-y-0.5 transition-transform"
                  :disabled="editLoading"
                  @click="saveEdit"
                >
                  <div class="absolute inset-0 bg-gradient-to-b from-questy-gold to-[#d4af37]" />
                  <div class="relative px-4 py-3 flex items-center justify-center border-b-4 border-[#554300]/40">
                    <span class="font-bold text-[#3c2f00] text-sm">
                      {{ editLoading ? "Sauvegarde..." : "Sauvegarder" }}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </template>

          <!-- Déconnexion -->
          <button
            class="w-full py-3 border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
            @click="logout"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>

    <UiBottomNav />
  </div>
</template>
