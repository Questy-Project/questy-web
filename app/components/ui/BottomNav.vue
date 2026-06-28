<script setup lang="ts">
const route = useRoute();
const authStore = useAuthStore();

const allTabs = [
  { label: 'Auberge',   img: '/images/icons/icon-acceuil.png',    path: '/dashboard' },
  { label: 'Activités', img: '/images/icons/icon-activities.png', path: '/activities' },
  { label: 'Défis',     img: '/images/icons/icon-challenge.png',  path: '/challenges' },
  { label: 'Tournoi',   img: '/images/icons/icon-tournament.png', path: '/tournament' },
  { label: 'Profil',    img: '/images/icons/icon-profil.png',     path: '/profile' },
  { label: 'Admin',     img: '/images/icons/icon-admin.png',      path: '/admin', adminOnly: true },
];

const tabs = computed(() =>
  allTabs.filter(t => !t.adminOnly || authStore.isAdmin)
);
</script>

<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0d0a06]/90 backdrop-blur-xl border-t border-questy-gold/20 z-50">
    <div
      class="max-w-lg mx-auto grid"
      :class="{ 'grid-cols-4': tabs.length === 4, 'grid-cols-5': tabs.length === 5, 'grid-cols-6': tabs.length === 6 }"
    >
      <template v-for="tab in tabs" :key="tab.path">
        <NuxtLink
          v-if="!tab.disabled"
          :to="tab.path"
          class="flex flex-col items-center py-2 text-xs gap-1 transition-all"
          :class="route.path === tab.path
            ? 'text-questy-gold border-t-2 border-questy-gold'
            : 'text-questy-violet/60'"
        >
          <img
            :src="tab.img"
            :alt="tab.label"
            class="w-8 h-8 object-contain transition-opacity"
            :class="route.path === tab.path ? 'opacity-100' : 'opacity-40'"
          />
          <span>{{ tab.label }}</span>
        </NuxtLink>
        <span
          v-else
          title="Bientôt disponible"
          class="flex flex-col items-center py-2 text-xs gap-1 text-questy-violet/30 cursor-not-allowed"
        >
          <img :src="tab.img" :alt="tab.label" class="w-8 h-8 object-contain opacity-20" />
          <span>{{ tab.label }}</span>
        </span>
      </template>
    </div>
  </nav>
</template>
