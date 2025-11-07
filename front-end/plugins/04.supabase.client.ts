import { createClient } from "@supabase/supabase-js";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const supabaseUrl = config.public.supabaseUrl;
  const supabaseAnonKey = config.public.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    // do not crash — provide a no-op client in dev if env isn't set
    // This will make errors easier to debug at runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const noop = {} as any;
    return {
      provide: {
        supabase: noop,
      },
    };
  }

  const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
    auth: {
      // keep session persisted in client
      persistSession: true,
      // avoid automatic session detection in URL (we handle redirects ourselves)
      detectSessionInUrl: false,
    },
  });

  return {
    provide: {
      supabase,
    },
  };
});

