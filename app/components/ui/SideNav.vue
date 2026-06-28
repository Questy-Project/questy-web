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
  <nav class="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center z-50 bg-[#0d0a06]/90 backdrop-blur-xl border-r border-questy-gold/10">

    <!-- Logo -->
    <div class="w-full flex items-center justify-center py-4 border-b border-questy-gold/10">
      <img src="/images/logo.png" alt="Questy" class="w-12 h-12 object-contain rounded-full" />
    </div>

    <!-- Navigation -->
    <div class="flex-1 flex flex-col items-center justify-start gap-1 w-full px-2 py-4">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="relative flex flex-col items-center gap-2 py-3 w-full rounded-xl text-xs transition-all duration-200 group"
        :class="route.path === tab.path
          ? 'bg-questy-gold/15 text-questy-gold'
          : 'text-questy-light/70 hover:bg-white/5 hover:text-questy-light'"
      >
        <img
          :src="tab.img"
          :alt="tab.label"
          class="w-10 h-10 object-contain transition-all duration-200"
          :class="route.path === tab.path
            ? 'opacity-100 drop-shadow-[0_0_6px_rgba(242,202,80,0.7)]'
            : 'opacity-60 group-hover:opacity-80'"
        />
        <span class="text-center leading-tight font-semibold tracking-wide">{{ tab.label }}</span>
      </NuxtLink>
    </div>

    <!-- Bas : séparateur décoratif -->
    <div class="w-8 h-px bg-questy-gold/20 mb-4" />
  </nav>
</template>
