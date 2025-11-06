import type { AuthUser, SignUpData, SignInData, AuthError, AuthResponse } from "~/types/auth";
import type { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const supabase = useSupabase();
  const router = useRouter();

  // Reactive state
  const user = useState<User | null>("auth_user", () => null);
  const session = useState<Session | null>("auth_session", () => null);
  const loading = useState<boolean>("auth_loading", () => false);
  const error = useState<AuthError | null>("auth_error", () => null);

  // Map Supabase errors to user-friendly messages
  const mapAuthError = (err: any): AuthError => {
    if (!err) {
      return { message: "An unknown error occurred" };
    }

    const errorMessage = err.message || err.error_description || "An error occurred";
    let message = errorMessage;

    // Map common errors to user-friendly messages
    if (errorMessage.includes("User already registered") || errorMessage.includes("already registered")) {
      message = "This email is already registered. Please sign in instead.";
    } else if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("Invalid credentials")) {
      message = "Invalid email or password. Please try again.";
    } else if (errorMessage.includes("Email not confirmed")) {
      message = "Please check your email to confirm your account.";
    } else if (errorMessage.includes("Password")) {
      message = "Password must be at least 6 characters.";
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      message = "Connection error. Please check your internet and try again.";
    }

    return {
      message,
      code: err.code || err.status,
      status: err.status || err.statusCode,
    };
  };

  // Get current user
  const getUser = async (): Promise<User | null> => {
    try {
      loading.value = true;
      error.value = null;

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      user.value = currentUser;
      return currentUser;
    } catch (err: any) {
      error.value = mapAuthError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Get current session
  const getSession = async (): Promise<Session | null> => {
    try {
      loading.value = true;
      error.value = null;

      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      session.value = currentSession;
      user.value = currentSession?.user ?? null;
      return currentSession;
    } catch (err: any) {
      error.value = mapAuthError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Sign up
  const signUp = async (data: SignUpData): Promise<AuthResponse> => {
    try {
      loading.value = true;
      error.value = null;

      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        const validationError: AuthError = {
          message: "Passwords do not match",
        };
        error.value = validationError;
        return { user: null, error: validationError };
      }

      // Sign up with Supabase
      const {
        data: authData,
        error: signUpError,
      } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            designation: data.designation,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create profile in profiles table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            email: data.email,
            designation: data.designation,
            role: "user", // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Don't throw - user is created, profile can be fixed later
        }
      }

      user.value = authData.user;
      session.value = authData.session;

      return {
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email || "",
          designation: data.designation,
        } as AuthUser : null,
        error: null,
      };
    } catch (err: any) {
      const authError = mapAuthError(err);
      error.value = authError;
      return { user: null, error: authError };
    } finally {
      loading.value = false;
    }
  };

  // Sign in
  const signIn = async (data: SignInData): Promise<AuthResponse> => {
    try {
      loading.value = true;
      error.value = null;

      const {
        data: authData,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) throw signInError;

      user.value = authData.user;
      session.value = authData.session;

      // Fetch user profile to get designation
      let designation: string | undefined;
      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("designation")
          .eq("id", authData.user.id)
          .single();

        designation = profile?.designation;
      }

      return {
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email || "",
          designation,
        } as AuthUser : null,
        error: null,
      };
    } catch (err: any) {
      const authError = mapAuthError(err);
      error.value = authError;
      return { user: null, error: authError };
    } finally {
      loading.value = false;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      user.value = null;
      session.value = null;
    } catch (err: any) {
      error.value = mapAuthError(err);
    } finally {
      loading.value = false;
    }
  };

  // Listen to auth state changes
  const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange((event, currentSession) => {
      session.value = currentSession;
      user.value = currentSession?.user ?? null;
      callback(event, currentSession);
    });
  };

  // Initialize auth state on mount (only on client)
  onMounted(() => {
    getSession();
  });

  return {
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),
    signUp,
    signIn,
    signOut,
    getUser,
    getSession,
    onAuthStateChange,
  };
};

