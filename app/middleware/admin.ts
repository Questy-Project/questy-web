export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();
  if (!auth.user) {
    try {
      await auth.fetchUser();
    } catch {
      return navigateTo('/dashboard');
    }
  }
  if (!auth.isAdmin) return navigateTo('/dashboard');
});
