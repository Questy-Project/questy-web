import { defineStore } from "pinia";
import type { AvatarResponse } from "~/types";

export const useAvatarStore = defineStore("avatar", () => {
  const avatar = ref<AvatarResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

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
  return { avatar, loading, error, maxStat, fetchAvatar
  }
});
