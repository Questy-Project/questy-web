<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] });

type StatKey = 'strength' | 'agility' | 'endurance' | 'intelligence' | 'spirit' | 'vitality';

interface AdminUser {
  id: string;
  pseudo: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar: {
    level: number;
    xp: number;
    heroClass: string;
    strength: number;
    agility: number;
    endurance: number;
    intelligence: number;
    spirit: number;
    vitality: number;
  } | null;
  parts: { stock: number } | null;
}

const users = ref<AdminUser[]>([]);
const loadingUsers = ref(false);

async function loadUsers() {
  loadingUsers.value = true;
  try {
    users.value = await useApi<AdminUser[]>('/admin/users');
    users.value.forEach(u => {
      partsEdit.value[u.id] = u.parts?.stock ?? 0;
    });
  } finally {
    loadingUsers.value = false;
  }
}

onMounted(() => loadUsers());

const cronLoading = ref<Record<string, boolean>>({});
const cronMessages = ref<Record<string, string>>({});

async function triggerCron(key: string, endpoint: string) {
  cronLoading.value[key] = true;
  cronMessages.value[key] = '';
  try {
    const res = await useApi<{ message: string }>(endpoint, { method: 'POST' });
    cronMessages.value[key] = res.message;
    setTimeout(() => { cronMessages.value[key] = ''; }, 3000);
  } catch {
    cronMessages.value[key] = 'Erreur lors de l\'exécution';
  } finally {
    cronLoading.value[key] = false;
  }
}

const partsEdit = ref<Record<string, number>>({});
const partsLoading = ref<Record<string, boolean>>({});

async function submitParts(userId: string) {
  partsLoading.value[userId] = true;
  try {
    await useApi(`/admin/users/${userId}/parts`, {
      method: 'PATCH',
      body: { stock: partsEdit.value[userId] },
    });
    await loadUsers();
  } finally {
    partsLoading.value[userId] = false;
  }
}

async function resetUser(user: AdminUser) {
  if (!window.confirm(`Réinitialiser ${user.pseudo} ? Cette action remet l'avatar à zéro.`)) return;
  await useApi(`/admin/users/${user.id}/reset`, { method: 'POST' });
  await loadUsers();
}

const statsModal = ref<{ open: boolean; user: AdminUser | null }>({ open: false, user: null });
const statsForm = ref<Record<StatKey, number>>({
  strength: 0, agility: 0, endurance: 0, intelligence: 0, spirit: 0, vitality: 0,
});
const statsLoading = ref(false);
const statFields: { key: StatKey; label: string }[] = [
  { key: 'strength',     label: 'Force' },
  { key: 'agility',      label: 'Agilité' },
  { key: 'endurance',    label: 'Endurance' },
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'spirit',       label: 'Esprit' },
  { key: 'vitality',     label: 'Vitalité' },
];

function openStatsModal(user: AdminUser) {
  statsModal.value = { open: true, user };
  statsForm.value = {
    strength:     user.avatar?.strength     ?? 0,
    agility:      user.avatar?.agility      ?? 0,
    endurance:    user.avatar?.endurance    ?? 0,
    intelligence: user.avatar?.intelligence ?? 0,
    spirit:       user.avatar?.spirit       ?? 0,
    vitality:     user.avatar?.vitality     ?? 0,
  };
}

function statToXp(stat: number): number {
  if (stat <= 0) return 0;
  return (Math.exp(stat / 23) - 1) / 0.015;
}

async function submitStats() {
  if (!statsModal.value.user) return;
  statsLoading.value = true;
  try {
    await useApi(`/admin/users/${statsModal.value.user.id}/stats`, {
      method: 'PATCH',
      body: {
        strengthXp:     statToXp(statsForm.value.strength),
        agilityXp:      statToXp(statsForm.value.agility),
        enduranceXp:    statToXp(statsForm.value.endurance),
        intelligenceXp: statToXp(statsForm.value.intelligence),
        spiritXp:       statToXp(statsForm.value.spirit),
        vitalityXp:     statToXp(statsForm.value.vitality),
      },
    });
    statsModal.value.open = false;
    await loadUsers();
  } finally {
    statsLoading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-questy-dark text-questy-light pb-24 px-4 pt-6 bg-cover bg-center"
    style="background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/images/bg-tavern.jpg')"
  >
    <h1
      class="text-2xl font-bold text-questy-gold mb-6"
      style="font-family: 'Newsreader', serif"
    >
      ⚔️ Administration
    </h1>

    <!-- Section Crons -->
    <section class="bg-questy-sheet/90 border border-questy-gold/40 rounded-xl p-4 mb-6">
      <h2 class="text-xs font-bold text-questy-gold mb-4 uppercase tracking-wider">Crons</h2>

      <div class="space-y-3">
        <div>
          <button
            :disabled="cronLoading['reset']"
            class="w-full py-3 bg-questy-gold/20 border border-questy-gold/40 rounded-lg text-questy-gold font-bold text-sm hover:bg-questy-gold/30 transition disabled:opacity-50"
            @click="triggerCron('reset', '/admin/crons/monthly-reset')"
          >
            {{ cronLoading['reset'] ? 'Exécution...' : '⚡ Déclencher le reset mensuel' }}
          </button>
          <p v-if="cronMessages['reset']" class="text-xs text-green-400 mt-1 text-center">
            ✅ {{ cronMessages['reset'] }}
          </p>
        </div>

        <div>
          <button
            :disabled="cronLoading['recharge']"
            class="w-full py-3 bg-questy-gold/20 border border-questy-gold/40 rounded-lg text-questy-gold font-bold text-sm hover:bg-questy-gold/30 transition disabled:opacity-50"
            @click="triggerCron('recharge', '/admin/crons/parts-recharge')"
          >
            {{ cronLoading['recharge'] ? 'Exécution...' : '🔁 Déclencher la recharge nocturne' }}
          </button>
          <p v-if="cronMessages['recharge']" class="text-xs text-green-400 mt-1 text-center">
            ✅ {{ cronMessages['recharge'] }}
          </p>
        </div>
      </div>
    </section>

    <!-- Section Utilisateurs -->
    <section>
      <h2 class="text-xs font-bold text-questy-gold mb-4 uppercase tracking-wider">Utilisateurs</h2>

      <div v-if="loadingUsers" class="text-center text-questy-light/50 py-8 text-sm">
        Chargement...
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="bg-questy-sheet/90 border border-questy-gold/40 rounded-xl p-4"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span class="font-bold text-questy-light text-sm">{{ user.pseudo }}</span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-bold"
                  :class="user.role === 'ADMIN'
                    ? 'bg-questy-gold/20 text-questy-gold'
                    : 'bg-questy-violet/20 text-questy-violet/80'"
                >{{ user.role }}</span>
              </div>
              <p class="text-xs text-questy-light/50">{{ user.email }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-questy-gold font-bold">{{ user.avatar?.heroClass ?? '—' }}</p>
              <p class="text-xs text-questy-light/50">Niv. {{ user.avatar?.level ?? 0 }}</p>
            </div>
          </div>

          <p class="text-xs text-questy-light/60 mb-3">
            ❤️ {{ user.parts?.stock ?? 0 }} / 12 parties
          </p>

          <div class="grid grid-cols-3 gap-2">
            <button
              class="py-2 text-xs bg-blue-500/20 border border-blue-400/40 rounded-lg text-blue-300 font-bold hover:bg-blue-500/30 transition"
              @click="openStatsModal(user)"
            >
              📊 Stats
            </button>

            <div class="flex gap-1">
              <input
                v-model.number="partsEdit[user.id]"
                type="number"
                min="0"
                max="12"
                class="w-full text-xs text-center bg-questy-dark border border-questy-gold/30 rounded-lg text-questy-light py-1"
              />
              <button
                :disabled="partsLoading[user.id]"
                class="px-2 text-xs bg-questy-gold/20 border border-questy-gold/40 rounded-lg text-questy-gold font-bold hover:bg-questy-gold/30 transition disabled:opacity-50"
                @click="submitParts(user.id)"
              >❤️</button>
            </div>

            <button
              class="py-2 text-xs bg-red-500/20 border border-red-400/40 rounded-lg text-red-400 font-bold hover:bg-red-500/30 transition"
              @click="resetUser(user)"
            >
              🗑️ Reset
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal stats -->
    <div
      v-if="statsModal.open"
      class="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
      @click.self="statsModal.open = false"
    >
      <div class="bg-questy-sheet border border-questy-gold/40 rounded-xl p-5 w-full max-w-sm">
        <h3
          class="text-questy-gold font-bold mb-4 text-lg"
          style="font-family: 'Newsreader', serif"
        >
          Stats — {{ statsModal.user?.pseudo }}
        </h3>

        <div class="space-y-3">
          <div v-for="field in statFields" :key="field.key">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-questy-light/70">{{ field.label }}</span>
              <span class="text-questy-gold font-bold">{{ statsForm[field.key] }}</span>
            </div>
            <input
              v-model.number="statsForm[field.key]"
              type="range"
              min="0"
              max="100"
              class="w-full accent-questy-gold"
            />
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button
            class="flex-1 py-2 text-sm border border-questy-gold/30 rounded-lg text-questy-light/60 hover:bg-questy-sheet/50"
            @click="statsModal.open = false"
          >
            Annuler
          </button>
          <button
            :disabled="statsLoading"
            class="flex-1 py-2 text-sm bg-questy-gold/20 border border-questy-gold/40 rounded-lg text-questy-gold font-bold hover:bg-questy-gold/30 transition disabled:opacity-50"
            @click="submitStats"
          >
            {{ statsLoading ? '...' : 'Appliquer' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
