<script lang="ts" setup>
import type { SignUpData } from "~/types/auth";

// SEO
const config = useRuntimeConfig();
const pageTitle = "Sign Up - ZapMinds Academy";

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  ogUrl: config.public.siteBaseUrl + config.app.baseURL + "signup",
  ogType: "website",
  twitterCard: "summary",
  twitterTitle: pageTitle,
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
});

const router = useRouter();
const { signUp, loading, error } = useAuth();

// Form state
const formData = reactive<SignUpData>({
  email: "",
  password: "",
  confirmPassword: "",
  designation: "",
});

const formErrors = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  designation: "",
});

// Validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = (): boolean => {
  let isValid = true;

  // Reset errors
  formErrors.email = "";
  formErrors.password = "";
  formErrors.confirmPassword = "";
  formErrors.designation = "";

  // Email validation
  if (!formData.email) {
    formErrors.email = "Email is required";
    isValid = false;
  } else if (!validateEmail(formData.email)) {
    formErrors.email = "Please enter a valid email address";
    isValid = false;
  }

  // Password validation
  if (!formData.password) {
    formErrors.password = "Password is required";
    isValid = false;
  } else if (formData.password.length < 6) {
    formErrors.password = "Password must be at least 6 characters";
    isValid = false;
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    formErrors.confirmPassword = "Please confirm your password";
    isValid = false;
  } else if (formData.password !== formData.confirmPassword) {
    formErrors.confirmPassword = "Passwords do not match";
    isValid = false;
  }

  // Designation validation
  if (!formData.designation || formData.designation.trim() === "") {
    formErrors.designation = "Designation is required";
    isValid = false;
  }

  return isValid;
};

// Handle form submission
const handleSubmit = async (e: Event) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  const result = await signUp(formData);

  if (result.error) {
    // Error is already set in the composable
    return;
  }

  if (result.user) {
    // Success - redirect to dashboard
    router.push("/dashboard");
  }
};
</script>

<template>
  <div :class="$style.root">
    <div class="container">
      <div :class="$style.formContainer">
        <h1 :class="$style.title">Sign Up</h1>
        <p :class="$style.subtitle">Create a new account</p>

        <form @submit="handleSubmit" :class="$style.form">
          <!-- Email Field -->
          <div :class="$style.field">
            <label for="email" :class="$style.label">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              :class="[$style.input, formErrors.email && $style['input--error']]"
              placeholder="your.email@example.com"
              required
              :disabled="loading"
            />
            <span v-if="formErrors.email" :class="$style.errorMessage">
              {{ formErrors.email }}
            </span>
          </div>

          <!-- Password Field -->
          <div :class="$style.field">
            <label for="password" :class="$style.label">Password</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              :class="[$style.input, formErrors.password && $style['input--error']]"
              placeholder="Minimum 6 characters"
              required
              minlength="6"
              :disabled="loading"
            />
            <span v-if="formErrors.password" :class="$style.errorMessage">
              {{ formErrors.password }}
            </span>
          </div>

          <!-- Confirm Password Field -->
          <div :class="$style.field">
            <label for="confirmPassword" :class="$style.label">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              :class="[$style.input, formErrors.confirmPassword && $style['input--error']]"
              placeholder="Re-enter your password"
              required
              :disabled="loading"
            />
            <span v-if="formErrors.confirmPassword" :class="$style.errorMessage">
              {{ formErrors.confirmPassword }}
            </span>
          </div>

          <!-- Designation Field -->
          <div :class="$style.field">
            <label for="designation" :class="$style.label">Designation at Zapcom</label>
            <input
              id="designation"
              v-model="formData.designation"
              type="text"
              :class="[$style.input, formErrors.designation && $style['input--error']]"
              placeholder="e.g., Software Engineer, Product Manager"
              required
              :disabled="loading"
            />
            <span v-if="formErrors.designation" :class="$style.errorMessage">
              {{ formErrors.designation }}
            </span>
          </div>

          <!-- Server Error -->
          <div v-if="error" :class="$style.serverError">
            {{ error.message }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :class="[$style.submitButton, loading && $style['submitButton--loading']]"
            :disabled="loading"
          >
            <span v-if="loading">Signing Up...</span>
            <span v-else>Sign Up</span>
          </button>

          <!-- Sign In Link -->
          <p :class="$style.linkText">
            Already have an account?
            <NuxtLink to="/signin" :class="$style.link">Sign In</NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.root {
  padding-top: calc(3.2rem + 80px); // Account for fixed header
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.formContainer {
  max-width: 28rem;
  width: 100%;
  padding: 2rem;
}

.title {
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-family: var(--text-font);
  font-size: 1rem;
  margin: 0 0 2rem 0;
  opacity: 0.7;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-family: var(--text-font);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground-color);
}

.input {
  padding: 0.75rem 1rem;
  font-family: var(--text-font);
  font-size: 1rem;
  border: 2px solid var(--foreground-color);
  background: var(--background-color);
  color: var(--foreground-color);
  border-radius: 0.5rem;
  transition: border-color 0.2s, background 0.2s;

  &:focus {
    outline: none;
    border-color: var(--foreground-color);
    background: var(--background-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--error {
    border-color: #ef4444;
  }

  &::placeholder {
    opacity: 0.5;
  }
}

.errorMessage {
  font-family: var(--text-font);
  font-size: 0.875rem;
  color: #ef4444;
}

.serverError {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid #ef4444;
  border-radius: 0.5rem;
  color: #ef4444;
  font-family: var(--text-font);
  font-size: 0.875rem;
}

.submitButton {
  padding: 0.75rem 1.5rem;
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 1rem;
  background: var(--foreground-color);
  color: var(--background-color);
  border: 2px solid var(--foreground-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  pointer-events: auto;

  &:hover:not(:disabled) {
    background: transparent;
    color: var(--foreground-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--loading {
    cursor: wait;
  }
}

.linkText {
  font-family: var(--text-font);
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
  opacity: 0.7;
}

.link {
  color: var(--foreground-color);
  text-decoration: underline;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}
</style>
