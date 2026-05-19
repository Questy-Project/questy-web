import { defineStore } from "pinia";
import type { AvatarResponse } from "~/types";

export const useAvatarStore = defineStore("avatar", () => {
  const avatar = ref<AvatarResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const xpPercent = computed(() => {
    if (!avatar.value) return 0;
    const { xp, xpNextLevel, level } = avatar.value;
    const xpCurrentLevel = (((level - 1) * level) / 2) * 100;
    const range = xpNextLevel - xpCurrentLevel;
    if (range <= 0) return 100;
    return Math.min(Math.round(((xp - xpCurrentLevel) / range) * 100), 100);
  });

  // Stat la plus haute parmi les 6 — sert de référence pour les barres de progression
  const maxStat = computed(() => {
    if (!avatar.value) return 1;
    const { strength, agility, endurance, intelligence, spirit, vitality } =
      avatar.value;
    return Math.max(
      strength,
      agility,
      endurance,
      intelligence,
      spirit,
      vitality,
      1,
    );
  });

  async function fetchAvatar(){
    loading.value = true
    error.value = null
    try{
        avatar.value =await useApi<AvatarResponse> ('/avatar/me')
    }catch{
        error.value = "Impossible de charger l'avatar."
    } finally{
        loading.value = false
    }
  }
  return { avatar, loading, error, maxStat, xpPercent, fetchAvatar
  }
});
