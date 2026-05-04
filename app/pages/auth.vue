<script setup lang="ts">
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
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (mode.value === "register" && status === 409) {
      error.value = "Cet email est déjà utilisé.";
    } else {
      error.value = "Email ou mot de passe incorrect.";
    }
  }
}

function switchMode(newMode: "login" | "register") {
  mode.value = newMode;
  error.value = null;
  form.pseudo = "";
  form.email = "";
  form.password = "";
  form.passwordConfirm = "";
}
</script>

<template>
  <div
    class="min-h-screen bg-[#131313] text-questy-light flex flex-col"
    style="font-family: 'Be Vietnam Pro', sans-serif"
  >
    <!-- Background split-screen -->
    <div class="fixed inset-0 z-0 flex overflow-hidden">
      <!-- Gauche : athlète -->
      <div class="relative w-1/2 h-full border-r border-questy-gold/20">
        <img
          class="absolute inset-0 w-full h-full object-cover grayscale opacity-40"
          src="/img/bg-athlete.jpg"
          alt=""
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
      </div>
      <!-- Droite : paladin -->
      <div class="relative w-1/2 h-full">
        <img
          class="absolute inset-0 w-full h-full object-cover"
          src="/img/bg-paladin.jpg"
          alt=""
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
      </div>
      <!-- Séparateur central doré -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="h-full w-px bg-questy-gold/30 shadow-[0_0_20px_rgba(242,202,80,0.5)]" />
      </div>
    </div>

    <!-- Contenu principal -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
      <!-- En-tête de marque -->
      <header class="mb-10 text-center">
        <h1
          class="text-4xl font-bold italic text-questy-gold mb-2"
          style="font-family: 'Newsreader', serif; text-shadow: 0 0 8px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,1), 2px 2px 0 rgba(0,0,0,0.8)"
        >
          L'Épopée de Questy
        </h1>
        <p
          class="text-base text-[#d0c5af] uppercase tracking-[0.2em]"
          style="font-family: 'Newsreader', serif; text-shadow: 0 0 8px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,1)"
        >
          Transformez vos efforts en légende
        </p>
      </header>

      <!-- Card : Portail des Héros -->
      <div class="relative w-full max-w-md shadow-2xl border border-questy-gold/40">
        <!-- Coins ornementaux dorés -->
        <span class="absolute top-[-3px] left-[-3px] w-7 h-7 border-t-2 border-l-2 border-questy-gold" />
        <span class="absolute top-[-3px] right-[-3px] w-7 h-7 border-t-2 border-r-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] left-[-3px] w-7 h-7 border-b-2 border-l-2 border-questy-gold" />
        <span class="absolute bottom-[-3px] right-[-3px] w-7 h-7 border-b-2 border-r-2 border-questy-gold" />

        <div class="relative backdrop-blur-sm p-6 flex flex-col gap-5 bg-questy-dark/65">
          <!-- Titre de la card -->
          <div class="text-center">
            <h2
              class="text-2xl font-semibold text-questy-gold mb-1"
              style="font-family: 'Newsreader', serif"
            >
              {{ mode === "login" ? "Portail des Héros" : "Forge ton Héros" }}
            </h2>
            <div class="h-0.5 w-24 bg-questy-gold mx-auto rounded-full shadow-[0_0_8px_rgba(242,202,80,0.6)]" />
          </div>

          <!-- Formulaire -->
          <form class="space-y-4" @submit.prevent="submit">
            <!-- Pseudo (inscription uniquement) -->
            <div v-if="mode === 'register'" class="space-y-1.5">
              <label class="font-bold text-sm text-[#d4af37] flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">person_add</span>
                ✦ Nom du Héros
              </label>
              <input
                v-model="form.pseudo"
                type="text"
                placeholder="Ton pseudo..."
                required
                class="w-full bg-questy-sheet/50 border-2 border-[#99907c]/30 text-questy-light p-3 focus:border-questy-gold focus:outline-none placeholder:text-questy-light/30"
              />
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="font-bold text-sm text-[#d4af37] flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">person</span>
                ✦ Identité du Héros
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="email@example.com"
                required
                class="w-full bg-questy-sheet/50 border-2 border-[#99907c]/30 text-questy-light p-3 focus:border-questy-gold focus:outline-none placeholder:text-questy-light/30"
              />
            </div>

            <!-- Mot de passe -->
            <div class="space-y-1.5">
              <label class="font-bold text-sm text-[#d4af37] flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">lock</span>
                ✦ Sceau de Sécurité
              </label>
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                required
                class="w-full bg-questy-sheet/50 border-2 border-[#99907c]/30 text-questy-light p-3 focus:border-questy-gold focus:outline-none placeholder:text-questy-light/30"
              />
            </div>

            <!-- Confirmation mot de passe (inscription uniquement) -->
            <div v-if="mode === 'register'" class="space-y-1.5">
              <label class="font-bold text-sm text-[#d4af37] flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">lock_reset</span>
                ✦ Confirmer le Sceau
              </label>
              <input
                v-model="form.passwordConfirm"
                type="password"
                placeholder="••••••••"
                required
                class="w-full bg-questy-sheet/50 border-2 border-[#99907c]/30 text-questy-light p-3 focus:border-questy-gold focus:outline-none placeholder:text-questy-light/30"
              />
            </div>

            <!-- Message d'erreur -->
            <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>

            <!-- Bouton de soumission -->
            <button
              type="submit"
              class="group relative w-full overflow-hidden active:translate-y-0.5 transition-transform"
            >
              <div class="absolute inset-0 bg-gradient-to-b from-questy-gold to-[#d4af37]" />
              <div class="relative px-6 py-4 flex items-center justify-center gap-3 border-b-4 border-[#554300]/40">
                <span class="font-bold text-[#3c2f00] uppercase tracking-widest text-sm">
                  {{ mode === "login" ? "⚔ Entrer dans la Légende" : "🛡 Rejoindre l'Épopée" }}
                </span>
              </div>
            </button>
          </form>

          <!-- Lien de bascule connexion / inscription -->
          <div class="text-center text-sm">
            <template v-if="mode === 'login'">
              <span class="text-[#d0c5af]">Pas encore de compte ?</span>
              <button
                class="text-questy-gold ml-1 underline underline-offset-2 hover:text-[#e9c349] transition-colors"
                @click="switchMode('register')"
              >
                Créer mon Héros →
              </button>
            </template>
            <template v-else>
              <span class="text-[#d0c5af]">Déjà un compte ?</span>
              <button
                class="text-questy-gold ml-1 underline underline-offset-2 hover:text-[#e9c349] transition-colors"
                @click="switchMode('login')"
              >
                Se connecter →
              </button>
            </template>
          </div>
        </div>
      </div>
    </main>

    <!-- Overlay gradient décoratif -->
    <div class="fixed inset-0 pointer-events-none z-20 mix-blend-soft-light opacity-20 bg-gradient-to-tr from-[#131313] via-transparent to-questy-gold/10" />
  </div>
</template>
