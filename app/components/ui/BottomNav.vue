<script setup lang="ts">
const route = useRoute();

const tabs = [
  { label: "Accueil", icon: "home", path: "/dashboard" },
  { label: "Activités", icon: "bolt", path: "/activities" },
  { label: "Tournoi", icon: "emoji_events", path: "/tournament", disabled: true },
  { label: "Profil", icon: "person", path: "/profile" },
];
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-questy-sheet border-t border-questy-gold/20 z-50">
    <div class="grid grid-cols-4 max-w-lg mx-auto">
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
