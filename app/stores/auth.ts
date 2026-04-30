import { defineStore } from "pinia";
import type { User, AuthResponse } from '~/types';

// Store d'authentification — persiste le JWT via cookie et expose l'user connecté à toute l'app
export const useAuthStore = defineStore("auth", () => {
  const token = useCookie<string | null>("token"); // Réactif et persiste entre les rechargements
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    const data = await useApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    token.value = data.access_token;
    user.value = await useApi<User>('/users/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
  }

  async function register(pseudo: string, email: string, password: string) {
    const data = await useApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { pseudo, email, password },
    });
    token.value = data.access_token;
    user.value = await useApi<User>('/users/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
  }

    async function fetchUser() {
        user.value = await useApi<User>('/users/me');
    }

    function logout(){
        token.value = null;
        user.value= null;
    }
    return{
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        fetchUser,
    }
});
