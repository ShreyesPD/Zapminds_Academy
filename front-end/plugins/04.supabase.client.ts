export default defineNuxtPlugin(() => {
  // Supabase client is initialized in utils/supabase.ts
  // This plugin ensures Supabase is available on the client side
  // Auth state changes are handled by the useAuth composable
});

