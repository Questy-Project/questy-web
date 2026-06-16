import { defineStore } from "pinia";
import type { User, AuthResponse } from '~/types';

// Store d'authentification — persiste le JWT via cookie et expose l'user connecté à toute l'app
export const useAuthStore = defineStore("auth", () => {
  const token = useCookie<string | null>("token"); // Réactif et persiste entre les rechargements
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

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

  async function register(
    pseudo: string,
    email: string,
    password: string,
    customization?: { silhouette?: string; skinTone?: number; hairStyle?: number; hairColor?: number },
  ) {
    const data = await useApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { pseudo, email, password, ...customization },
    });
    token.value = data.access_token;
    user.value = await useApi<User>('/users/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
  }

    async function fetchUser() {
        user.value = await useApi<User>('/users/me');
    }

    async function updateProfile(pseudo: string, age: number | null) {
        await useApi('/users/me', { method: 'PATCH', body: { pseudo, age } });
        await fetchUser();
    }

    function logout(){
        token.value = null;
        user.value= null;
    }
    return{
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        fetchUser,
        updateProfile,
    }
});
