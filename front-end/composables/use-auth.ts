import { computed, watch } from "vue";

type StudentAuthState = {
  isAuthenticated: boolean;
  email: string | null;
  name: string | null;
};

type StudentAuthPayload = {
  email: string;
  name?: string | null;
};

const cookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

const formatNameFromEmail = (email: string) => {
  const base = email.split("@")[0] || "Zapmind Student";

  return base
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

export const useStudentAuth = () => {
  const cookie = useCookie<StudentAuthState>("za-student-auth", {
    ...cookieOptions,
    default: () => ({
      isAuthenticated: false,
      email: null,
      name: null,
    }),
  });

  const state = useState<StudentAuthState>("za-student-auth-state", () => ({
    isAuthenticated: cookie.value?.isAuthenticated ?? false,
    email: cookie.value?.email ?? null,
    name: cookie.value?.name ?? null,
  }));

  watch(
    state,
    (value) => {
      cookie.value = value;
    },
    { deep: true }
  );

  const login = (payload: StudentAuthPayload) => {
    state.value = {
      isAuthenticated: true,
      email: payload.email,
      name: payload.name ?? formatNameFromEmail(payload.email),
    };
  };

  const logout = () => {
    state.value = {
      isAuthenticated: false,
      email: null,
      name: null,
    };
  };

  return {
    authState: state,
    isAuthenticated: computed(() => state.value.isAuthenticated),
    profile: computed(() => ({
      email: state.value.email,
      name: state.value.name,
    })),
    login,
    logout,
  };
};
