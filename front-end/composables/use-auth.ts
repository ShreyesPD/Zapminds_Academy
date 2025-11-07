import { computed, ref, onMounted, onUnmounted } from "vue";

// Supabase-based student auth composable
export const useStudentAuth = () => {
  const nuxtApp = useNuxtApp();
  // $supabase is provided in the client plugin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (nuxtApp as any).$supabase as any;

  const user = ref<any | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  const profile = computed(() => ({
    email: user.value?.email ?? null,
    name:
      user.value?.user_metadata?.name ??
      (user.value?.email ? user.value.email.split("@")[0] : null),
  }));

  // Populate initial session/user
  const setUserFromSession = async () => {
    if (!supabase || !supabase.auth) return;
    try {
      const { data } = await supabase.auth.getSession();
      user.value = data?.session?.user ?? null;
    } catch (e) {
      user.value = null;
    }
  };

  let sub: any = null;
  onMounted(async () => {
    await setUserFromSession();

    if (supabase && supabase.auth && supabase.auth.onAuthStateChange) {
      const { data } = supabase.auth.onAuthStateChange(
        (event: string, session: any) => {
          user.value = session?.user ?? null;
        }
      );
      sub = data?.subscription ?? data;
    }
  });

  onUnmounted(() => {
    try {
      sub?.unsubscribe?.();
    } catch (e) {
      // ignore
    }
  });

  // Signup with email & password
  const signup = async (payload: {
    email: string;
    password: string;
    name?: string;
  }) => {
    if (!supabase || !supabase.auth)
      return { data: null, error: new Error("Supabase not configured") };
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: { name: payload.name ?? undefined }, // goes into user_metadata
      },
    });

    return { data, error };
  };

  // Login with email & password
  const login = async (payload: { email: string; password: string }) => {
    if (!supabase || !supabase.auth)
      return { data: null, error: new Error("Supabase not configured") };
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (!error) {
      // ensure local state is updated right away
      user.value = data?.user ?? data?.session?.user ?? user.value;
    }

    return { data, error };
  };

  const logout = async () => {
    if (!supabase || !supabase.auth) return;
    await supabase.auth.signOut();
    user.value = null;
  };

  return {
    // legacy shape kept: authState previously was a state object; now return user ref
    authState: user,
    isAuthenticated,
    profile,
    login,
    logout,
    signup,
  };
};
