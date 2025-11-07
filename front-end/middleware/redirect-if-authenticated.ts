// export default defineNuxtRouteMiddleware(() => {
//   // Avoid running auth checks during server-side rendering where client
//   // Supabase session isn't available. Let the page render and let client
//   // navigation handle redirects.
//   if (!process.client) return;

//   const { isAuthenticated } = useStudentAuth();

//   if (isAuthenticated.value) {
//     return navigateTo("/dashboard");
//   }
// });

// middleware/redirect-if-authenticated.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return;

  const nuxtApp = useNuxtApp();
  const supabase = (nuxtApp as any).$supabase;
  if (!supabase?.auth) return;

  supabase.auth
    .getSession()
    .then(({ data }) => {
      if (data?.session) navigateTo("/dashboard");
    })
    .catch(() => {});
});
