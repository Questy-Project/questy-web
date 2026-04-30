// Wrapper autour de $fetch — centralise l'URL de base et l'injection du JWT Bearer.
// Tous les appels API du projet passent par ici plutôt que d'appeler $fetch directement.
export const useApi = <T>(
  endpoint: string,
  options?: Parameters<typeof $fetch>[1],
) => {
  const token = useCookie("token"); // JWT stocké en cookie (jamais localStorage)
  const config = useRuntimeConfig(); // Lit NUXT_PUBLIC_API_URL selon l'environnement

  return $fetch<T>(`${config.public.apiUrl}${endpoint}`, {
    ...options,
    headers: {
      // Injecte Authorization depuis le cookie, sauf si l'appelant passe un header explicite
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      ...options?.headers,
    },
  });
};
