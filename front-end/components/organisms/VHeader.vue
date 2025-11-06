<script lang="ts" setup>
const { currentFeature } = useLevelExperience();
const route = useRoute();

const header = useTemplateRef("header");

// For landing page, use intersection observer
// For dashboard/auth pages, always show header immediately
const isDashboardOrAuthPage = computed(() => {
  return route.path.startsWith("/dashboard") || 
         route.path.startsWith("/signin") || 
         route.path.startsWith("/signup");
});

const { isVisible: intersectionVisible } = useIsVisible(header);

// Header should be visible immediately on dashboard/auth pages, or when intersection observer detects it
const isVisible = computed(() => {
  if (isDashboardOrAuthPage.value) {
    return true; // Always visible on dashboard/auth pages
  }
  return intersectionVisible.value; // Use intersection observer for landing page
});

// Auth state
const { user, signOut, loading: authLoading } = useAuth();
const router = useRouter();

const handleSignOut = async () => {
  await signOut();
  router.push("/");
};
</script>

<template>
  <header
    :class="[
      $style.root, 
      isVisible && $style['root--is-visible'],
      isDashboardOrAuthPage && $style['root--dashboard']
    ]"
    ref="header"
  >
    <div class="container">
      <div :class="$style.inner">
        <nav :class="$style.nav">
          <VHeaderSiteTitleLink />
          <div :class="$style.authButtons">
            <template v-if="user">
              <span :class="$style.userEmail">{{ user.email }}</span>
              <button
                @click="handleSignOut"
                :class="$style.authButton"
                :disabled="authLoading"
                type="button"
              >
                {{ authLoading ? "Signing Out..." : "Sign Out" }}
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/signin" :class="$style.authButton">Sign In</NuxtLink>
              <NuxtLink to="/signup" :class="[$style.authButton, $style['authButton--primary']]">Sign Up</NuxtLink>
            </template>
          </div>
        </nav>

        <div :class="$style.display" v-if="!isDashboardOrAuthPage">
          <ClientOnly>
            <Transition
              appear
              :enter-active-class="$style['header-element-enter-active']"
              :leave-active-class="$style['header-element-leave-active']"
              :enter-from-class="$style['header-element-enter-from']"
              :leave-to-class="$style['header-element-leave-to']"
            >
              <div :class="$style.palette" v-if="currentFeature >= 3">
                <VColorPaletteButton />
              </div>
            </Transition>

            <Transition
              appear
              :enter-active-class="$style['header-element-enter-active']"
              :leave-active-class="$style['header-element-leave-active']"
              :enter-from-class="$style['header-element-enter-from']"
              :leave-to-class="$style['header-element-leave-to']"
            >
              <div v-if="currentFeature >= 2" :class="$style['theme-switcher']">
                <VThemeSwitcher />
              </div>
            </Transition>
          </ClientOnly>

          <Transition
            appear
            :enter-active-class="$style['header-element-enter-active']"
            :leave-active-class="$style['header-element-leave-active']"
            :enter-from-class="$style['header-element-enter-from']"
            :leave-to-class="$style['header-element-leave-to']"
          >
            <div :class="$style['source-code']" v-show="currentFeature >= 1">
              <VSourceCodeLink />
            </div>
          </Transition>

          <ClientOnly>
            <div :class="$style.level">
              <VLevelManager />
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  </header>
</template>

<style module lang="scss">
.root {
  position: fixed;
  top: 0;
  z-index: 1000;
  right: 0;
  left: 0;
  pointer-events: none;
  background: var(--background-color);
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;

  &--is-visible {
    border-bottom-color: var(--foreground-color);
    opacity: 0.1;
  }

  // On dashboard/auth pages, always show with solid background
  &--dashboard {
    background: var(--background-color);
    border-bottom-color: var(--foreground-color);
    opacity: 1;
  }
}

.inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.nav {
  font-family: var(--display-font);
  text-transform: uppercase;
  flex-shrink: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  pointer-events: auto;

  // On landing page, animate in when visible
  transform: translate3d(0, -100%, 0);
  opacity: 0;
  transition: transform 0.35s ease(out-cubic), opacity 0.35s ease(in-quad);

  // Always visible on dashboard/auth pages or when intersection observer detects visibility
  .root--is-visible &,
  .root--dashboard & {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }

  @media (prefers-reduced-motion) {
    transition: none !important;
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

.authButtons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  pointer-events: auto;
}

.userEmail {
  font-family: var(--text-font);
  font-size: var(--small-font-size);
  color: var(--foreground-color);
  opacity: 0.8;
  margin-right: 0.5rem;

  @media screen and (max-width: 480px) {
    display: none;
  }
}

.authButton {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 1rem;
  font: inherit;
  font-size: var(--small-font-size);
  text-transform: uppercase;
  background: transparent;
  border: 2px solid var(--foreground-color);
  color: var(--foreground-color);
  cursor: pointer;
  border-radius: 1rem;
  pointer-events: auto;
  text-decoration: none;
  transition: background 0.35s ease(out-cubic), color 0.35s ease(out-cubic), border-color 0.35s ease(out-cubic);

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion) {
    transition: none !important;
  }

  &:hover,
  &:focus-visible {
    background: var(--foreground-color);
    color: var(--background-color);
  }

  &--primary {
    background: var(--foreground-color);
    color: var(--background-color);

    &:hover,
    &:focus-visible {
      background: transparent;
      color: var(--foreground-color);
    }
  }

  @media screen and (max-width: 480px) {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
  }
}

.display {
  display: flex;
  gap: 0 1rem;
  flex-shrink: 1;
}

.header-element-enter-active,
.header-element-leave-active {
  transform: translate3d(0, 0, 0);
  opacity: 1;

  transition: transform 0.35s ease(out-cubic), opacity 0.35s ease(in-quad);

  @media (prefers-reduced-motion) {
    transition: none !important;
  }
}

.header-element-enter-from,
.header-element-leave-to {
  transform: translate3d(0, -100%, 0);
  opacity: 0;
}

.palette {
  margin: 0 0.75rem 0 0;

  @media (prefers-reduced-motion) {
    transition: none !important;
  }
}

.theme-switcher {
  display: flex;
  align-items: center;

  @media (prefers-reduced-motion) {
    transition: none !important;
  }
}

.level {
  opacity: 0;
  transition: opacity 0.35s 0.15s ease(in-quad);

  @media (prefers-reduced-motion) {
    display: none;
    transition: none !important;
  }

  .root--is-visible & {
    opacity: 1;
  }
}
</style>
