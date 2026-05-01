<script setup lang="ts">
const route = useRoute();

const tabs = [
  { label: "Accueil", icon: "🏠", path: "/dashboard" },
  { label: "Activités", icon: "⚡", path: "/activities" },
  { label: "Tournoi", icon: "🏆", path: "/tournament", disabled: true },
  { label: "Profil", icon: "👤", path: "/profile" },
];
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-[#1a1245] border-t border-questy-purple/30 z-50"
  >
    <div class="grid grid-cols-4 max-w-lg mx-auto">
      <template v-for="tab in tabs" :key="tab.path">
        <NuxtLink
          v-if="!tab.disabled"
          :to="tab.path"
          class="flex flex-col items-center py-2 text-xs gap-1 transition-colors"
          :class="route.path === tab.path ? 'text-questy-purple' : 'text-questy-violet/60'"
        >
          <span class="text-lg leading-none">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </NuxtLink>
        <span
          v-else
          title="Bientôt disponible"
          class="flex flex-col items-center py-2 text-xs gap-1 text-questy-violet/30 cursor-not-allowed"
        >
          <span class="text-lg leading-none">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </span>
      </template>
    </div>
  </nav>
</template>
