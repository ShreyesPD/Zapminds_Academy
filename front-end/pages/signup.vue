<script setup lang="ts">
import { UIElements } from "~/assets/static-data/ui-elements";

definePageMeta({
  layout: "default",
  middleware: ["redirect-if-authenticated"],
});

const pageTitle = "Signup – Zapminds Academy";

useSeoMeta({
  title: pageTitle,
  description: UIElements.auth.subtitle,
});

const form = reactive({
  name: "",
  email: "",
  password: "",
  remember: true,
});

const { signup } = useStudentAuth();
const router = useRouter();
const errorMessage = ref<string | null>(null);

const onSubmit = async (e: Event) => {
  e.preventDefault();
  errorMessage.value = null;

  const res = await signup({
    name: form.name,
    email: form.email,
    password: form.password,
  });

  if (res?.error) {
    errorMessage.value = res.error.message || "Signup failed";
    return;
  }

  await router.push("/dashboard");
};
</script>

<template>
  <section :class="$style.root">
    <div class="container grid" :class="$style.container">
      <aside :class="$style.panel">
        <span :class="$style.badge">{{ UIElements.auth.portalLabel }}</span>
        <h1 :class="$style.title">Create your account</h1>
        <p :class="$style.subtitle">{{ UIElements.auth.subtitle }}</p>
      </aside>

      <div :class="$style.form">
        <form :class="$style['form-card']" @submit="onSubmit">
          <fieldset :class="$style['field-group']">
            <label :class="$style.label" for="name">Full name</label>
            <input
              v-model="form.name"
              id="name"
              name="name"
              required
              type="text"
              :class="$style.input"
            />
          </fieldset>

          <fieldset :class="$style['field-group']">
            <label :class="$style.label" for="email">{{
              UIElements.auth.emailLabel
            }}</label>
            <input
              v-model="form.email"
              id="email"
              name="email"
              required
              type="email"
              autocomplete="email"
              :class="$style.input"
            />
          </fieldset>

          <fieldset :class="$style['field-group']">
            <label :class="$style.label" for="password">{{
              UIElements.auth.passwordLabel
            }}</label>
            <input
              v-model="form.password"
              id="password"
              name="password"
              required
              type="password"
              autocomplete="new-password"
              :class="$style.input"
            />
          </fieldset>

          <div :class="$style['form-meta']">
            <label
              :class="$style.checkbox"
              title="Keep me signed in on this device"
            >
              <input v-model="form.remember" type="checkbox" />
              <span>{{ UIElements.auth.rememberMe }}</span>
            </label>

            <NuxtLink to="/login" :class="$style.link">
              {{
                UIElements.auth.alreadyHaveAccount ?? "Have an account? Log in"
              }}
            </NuxtLink>
          </div>

          <button type="submit" :class="$style.submit">Create account</button>

          <p
            v-if="errorMessage"
            :class="$style['form-error']"
            style="color: #ff6b6b"
          >
            {{ errorMessage }}
          </p>

          <p :class="$style['form-footer']">
            Already have an account?
            <NuxtLink to="/login" :class="$style.link">Log in</NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
.root {
  min-height: 100vh;
  padding: calc(var(--height-space) * 0.3) 0;
  background: radial-gradient(
      circle at 20% 20%,
      color-mix(in srgb, var(--foreground-color) 8%, transparent),
      transparent 55%
    ),
    radial-gradient(
      circle at 80% 30%,
      color-mix(in srgb, var(--color-palette-4) 12%, transparent),
      transparent 60%
    );
}

.container {
  row-gap: calc(var(--gutter-size) * 4);
}

.panel {
  grid-column: 3 / 11;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 2 / 10;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
    order: 2;
  }
}

.badge {
  display: inline-flex;
  align-self: flex-start;
  font-family: var(--display-font);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-radius: 999px;
  border: 1px solid currentColor;
  padding: 0.25rem 0.85rem;
  font-size: 0.7rem;
}

.title {
  /* replaced mixin with safe inline styles */
  font-family: var(--display-font);
  font-weight: 800;
  text-transform: none;
  letter-spacing: 0.01em;
  font-size: clamp(2rem, 3vw + 1rem, 3.25rem);
  line-height: 1.1;
  margin: 0;
  transform: none;
  -webkit-text-stroke: 0;
  text-align: left;
}

.subtitle {
  max-width: 32ch;
  font-size: 1.2rem;
  line-height: 1.5;
  opacity: 0.85;
}

.form {
  grid-column: 13 / 23;
  display: flex;
  justify-content: flex-end;

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 11 / 23;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
    order: 1;
    justify-content: center;
  }
}

.form-card {
  width: min(28rem, 100%);
  background: color-mix(in srgb, var(--background-color) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  border-radius: 1.5rem;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 30px 80px color-mix(in srgb, #000 25%, transparent);
  backdrop-filter: blur(22px);

  @media screen and (orientation: portrait) {
    padding: 2rem;
  }
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.label {
  font-family: var(--display-font);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.input {
  background: color-mix(in srgb, var(--background-color) 95%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 22%, transparent);
  border-radius: 0.9rem;
  padding: 0.85rem 1rem;
  color: inherit;
  font: inherit;
  transition: border-color 0.25s ease(out-cubic),
    box-shadow 0.25s ease(out-cubic);

  &:focus-visible {
    outline: none;
    border-color: var(--foreground-color);
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--foreground-color) 20%, transparent);
  }
}

.form-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;

  input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--foreground-color);
  }
}

.link {
  color: inherit;
  text-decoration: none;
  position: relative;
  padding-bottom: 0.2rem;

  &:after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    height: 1px;
    width: 100%;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s ease(out-cubic);
  }

  &:hover:after,
  &:focus-visible:after {
    transform: scaleX(1);
  }
}

.submit {
  background: var(--foreground-color);
  color: var(--background-color);
  border: 0;
  border-radius: 999px;
  padding: 0.9rem 1.25rem;
  font-family: var(--display-font);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: transform 0.35s ease(out-cubic), box-shadow 0.35s ease(out-cubic);

  &:hover,
  &:focus-visible {
    transform: translate3d(0, -0.2rem, 0);
    box-shadow: 0 18px 40px
      color-mix(in srgb, var(--foreground-color) 25%, transparent);
  }
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;

  span:first-child,
  span:last-child {
    flex: 1;
    height: 1px;
    background: color-mix(in srgb, var(--foreground-color) 20%, transparent);
  }
}

.providers {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;

  button {
    width: 100%;
    background: color-mix(in srgb, var(--foreground-color) 8%, transparent);
    border: 1px solid
      color-mix(in srgb, var(--foreground-color) 16%, transparent);
    border-radius: 999px;
    padding: 0.85rem 1.25rem;
    color: inherit;
    font: inherit;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: border-color 0.25s ease(out-cubic),
      transform 0.25s ease(out-cubic);

    &:hover,
    &:focus-visible {
      border-color: var(--foreground-color);
      transform: translate3d(0, -0.1rem, 0);
    }
  }
}

.form-footer {
  font-size: 0.85rem;
  opacity: 0.8;
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
</style>
