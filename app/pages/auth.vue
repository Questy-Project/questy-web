<script setup lang="ts">
// Page publique — redirige vers /dashboard si déjà connecté
const token = useCookie("token");
if (token.value) navigateTo("/dashboard");

const authStore = useAuthStore();

const mode = ref<"login" | "register">("login");
const error = ref<string | null>(null);

const form = reactive({
  pseudo: "",
  email: "",
  password: "",
  passwordConfirm: "",
});

async function submit() {
  error.value = null;

  if (mode.value === "register" && form.password !== form.passwordConfirm) {
    error.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  try {
    if (mode.value === "login") {
      await authStore.login(form.email, form.password);
    } else {
      await authStore.register(form.pseudo, form.email, form.password);
    }
    navigateTo("/dashboard");
  } catch {
    error.value = "Une erreur est survenue. Vérifie tes identifiants.";
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-questy-dark flex items-center justify-center px-4"
  >
    <div class="w-full max-w-sm bg-questy-light rounded-2xl p-6 shadow-xl">
      <!-- Toggle -->
      <div class="flex rounded-lg overflow-hidden mb-6">
        <button
          class="flex-1 py-2 text-sm font-semibold transition-colors"
          :class="
            mode === 'login'
              ? 'bg-questy-purple text-white'
              : 'bg-white text-questy-dark'
          "
          @click="mode = 'login'"
        >
          Connexion
        </button>
        <button
          class="flex-1 py-2 text-sm font-semibold transition-colors"
          :class="
            mode === 'register'
              ? 'bg-questy-purple text-white'
              : 'bg-white text-questy-dark'
          "
          @click="mode = 'register'"
        >
          Inscription
        </button>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <input
          v-if="mode === 'register'"
          v-model="form.pseudo"
          type="text"
          placeholder="Pseudo"
          required
          class="input"
        />
        <input
          v-model="form.email"
          type="email"
          placeholder="Email"
          required
          class="input"
        />
        <input
          v-model="form.password"
          type="password"
          placeholder="Mot de passe"
          required
          class="input"
        />
        <input
          v-if="mode === 'register'"
          v-model="form.passwordConfirm"
          type="password"
          placeholder="Confirmer le mot de passe"
          required
          class="input"
        />

        <!-- Message d'erreur -->
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

        <button
          type="submit"
          class="bg-questy-purple text-white py-2 rounded-lg font-semibold hover:bg-questy-violet transition-colors"
        >
          {{ mode === "login" ? "Se connecter" : "S'inscrire" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-questy-purple text-questy-dark;
}
</style>
