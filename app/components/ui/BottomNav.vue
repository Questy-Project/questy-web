<script setup lang="ts">
const route = useRoute();
const authStore = useAuthStore();

const allTabs = [
  { label: 'Accueil',    icon: 'home',              path: '/dashboard' },
  { label: 'Activités',  icon: 'bolt',              path: '/activities' },
  { label: 'Défis',      icon: 'swords',            path: '/challenges' },
  { label: 'Tournoi',    icon: 'emoji_events',      path: '/tournament' },
  { label: 'Profil',     icon: 'person',            path: '/profile' },
  { label: 'Admin',      icon: 'shield_person',     path: '/admin', adminOnly: true },
];

const tabs = computed(() =>
  allTabs.filter(t => !t.adminOnly || authStore.isAdmin)
);
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-questy-sheet border-t border-questy-gold/20 z-50">
    <div
      class="max-w-lg mx-auto grid"
      :class="{ 'grid-cols-4': tabs.length === 4, 'grid-cols-5': tabs.length === 5, 'grid-cols-6': tabs.length === 6 }"
    >
      <template v-for="tab in tabs" :key="tab.path">
        <NuxtLink
          v-if="!tab.disabled"
          :to="tab.path"
          class="flex flex-col items-center py-2 text-xs gap-1 transition-colors"
          :class="route.path === tab.path
            ? 'text-questy-gold border-t-2 border-questy-gold'
            : 'text-questy-violet/60'"
        >
          <span
            class="material-symbols-outlined text-xl leading-none"
            :style="route.path === tab.path ? 'font-variation-settings: \'FILL\' 1' : ''"
          >{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </NuxtLink>
        <span
          v-else
          title="Bientôt disponible"
          class="flex flex-col items-center py-2 text-xs gap-1 text-questy-violet/30 cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-xl leading-none">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </span>
      </template>
    </div>
  </nav>
</template>
