// export default defineNuxtRouteMiddleware(() => {
//   // Skip server-side check; Supabase client-side session isn't available on server.
//   if (!process.client) return;

//   const { isAuthenticated } = useStudentAuth();

//   if (!isAuthenticated.value) {
//     return navigateTo("/login");
//   }
// });

// middleware/student-auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return; // or wire a server session if you have it

  const nuxtApp = useNuxtApp();
  const supabase = (nuxtApp as any).$supabase;
  if (!supabase?.auth) return; // fail open

  const { data, error } = await supabase.auth.getSession();
  if (error) return; // fail open on transient error

  if (!data?.session) {
    // preserve where the user was trying to go
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }
});
