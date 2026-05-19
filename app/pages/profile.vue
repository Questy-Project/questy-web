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
  { key: "strength" as const, label: "Force", description: "Attaque physique" },
  {
    key: "agility" as const,
    label: "Agilité",
    description: "Esquive & vitesse",
  },
  {
    key: "endurance" as const,
    label: "Endurance",
    description: "Résistance aux dégâts",
  },
  {
    key: "intelligence" as const,
    label: "Intelligence",
    description: "Puissance magique",
  },
  { key: "spirit" as const, label: "Esprit", description: "Soins & soutien" },
  {
    key: "vitality" as const,
    label: "Vitalité",
    description: "Points de vie max",
  },
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
  <div class="min-h-screen bg-questy-dark text-questy-light pb-24">
    <div class="max-w-lg mx-auto px-4 py-6 space-y-6">
      <!-- Bloc 1 : Avatar -->
      <div v-if="avatar" class="flex flex-col items-center gap-3">
        <AvatarAvatar2D :hero-class="avatar.heroClass" />
        <p class="text-xl font-bold">{{ user?.pseudo }}</p>
        <AvatarHeroClass :hero-class="avatar.heroClass" />
        <p class="text-sm text-questy-light/60">Niveau {{ avatar.level }}</p>
        <div class="w-full">
          <div class="flex justify-between text-xs text-questy-light/60 mb-1">
            <span>XP</span>
            <span>{{ avatar.xp }} / {{ avatar.xpNextLevel }}</span>
          </div>
          <div class="bg-white/10 rounded-full h-2">
            <div
              class="h-full rounded-full bg-questy-purple transition-all duration-500"
              :style="{ width: `${xpPercent}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Bloc 2 : Stats -->
      <div v-if="avatar" class="bg-[#16213e] rounded-2xl p-4 space-y-4">
        <h2
          class="text-sm font-semibold text-questy-light/60 uppercase tracking-wider"
        >
          Statistiques
        </h2>
        <AvatarStatBar
          v-for="stat in stats"
          :key="stat.key"
          :label="stat.label"
          :value="avatar[stat.key]"
          :max-value="maxStat"
          :description="stat.description"
        />
      </div>

      <!-- Bloc 3 : Historique -->
      <div class="bg-[#16213e] rounded-2xl p-4">
        <h2
          class="text-sm font-semibold text-questy-light/60 uppercase tracking-wider mb-4"
        >
          Dernières activités
        </h2>
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
            <span class="text-xs font-bold text-questy-orange"
              >+{{ log.xpGained }} XP</span
            >
          </li>
        </ul>
      </div>

      <!-- Bloc 4 : Paramètres -->
      <div class="bg-[#16213e] rounded-2xl p-4 space-y-4">
        <h2
          class="text-sm font-semibold text-questy-light/60 uppercase tracking-wider"
        >
          Paramètres
        </h2>

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
            class="w-full py-3 rounded-xl border border-questy-light/20 text-sm text-questy-light"
            @click="startEdit"
          >
            ✏️ Modifier mes informations
          </button>
        </template>

        <!-- Mode édition -->
        <template v-else>
          <div class="space-y-3">
            <div>
              <label class="text-xs text-questy-light/60 mb-1 block"
                >Pseudo</label
              >
              <input
                v-model="editPseudo"
                type="text"
                class="w-full bg-[#0f3460] text-questy-light rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-questy-purple"
              />
            </div>
            <div>
              <label class="text-xs text-questy-light/60 mb-1 block">Âge</label>
              <input
                v-model.number="editAge"
                type="number"
                min="1"
                max="120"
                class="w-full bg-[#0f3460] text-questy-light rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-questy-purple"
              />
            </div>
            <p v-if="editError" class="text-xs text-red-400">{{ editError }}</p>
            <div class="grid grid-cols-2 gap-3">
              <button
                class="py-3 rounded-xl border border-questy-light/20 text-sm text-questy-light"
                @click="cancelEdit"
              >
                Annuler
              </button>
              <button
                class="py-3 rounded-xl bg-questy-orange text-white text-sm font-semibold"
                :disabled="editLoading"
                @click="saveEdit"
              >
                {{ editLoading ? "Sauvegarde..." : "Sauvegarder" }}
              </button>
            </div>
          </div>
        </template>

        <!-- Déconnexion -->
        <button
          class="w-full py-3 rounded-xl border border-red-500/50 text-red-400 text-sm"
          @click="logout"
        >
          Se déconnecter
        </button>
      </div>
    </div>
    <UiBottomNav />
  </div>
</template>
