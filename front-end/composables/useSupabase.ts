import { getSupabaseClient } from "~/utils/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export const useSupabase = (): SupabaseClient => {
  const config = useRuntimeConfig();
  
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be configured");
  }

  return getSupabaseClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  );
};

