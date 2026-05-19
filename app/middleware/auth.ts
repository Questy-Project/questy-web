// Redirige vers /auth si aucun token JWT n'est présent dans le cookie

export default defineNuxtRouteMiddleware(() => {
    const token = useCookie('token');

    if(!token.value){
        return navigateTo ('/auth');
    }
});