import { hoistUseStatements } from "./utils/hoist-use-statements";
import { siteConfig } from "../studio/site-config";

const runtimeConfig = {
  googleAPIKey: process.env.NUXT_GOOGLE_API_KEY,
  invoiceSheetId: process.env.NUXT_INVOICE_SHEET_ID,
  githubAccessToken: process.env.NUXT_GITHUB_GRAPHQL_TOKEN,
  umamiId: process.env.NUXT_UMAMI_ID,
  umamiHost: process.env.NUXT_UMAMI_HOST,
  judge0ApiKey: process.env.NUXT_JUDGE0_API_KEY,
  judge0ApiUrl: process.env.NUXT_JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com",
  public: {
    siteBaseUrl: process.env.NUXT_SITE_BASE_URL,
    siteDomain: process.env.NUXT_SITE_DOMAIN,
    supabaseUrl: process.env.NUXT_SUPABASE_URL || "https://qvwnzvhrsstqmftycegj.supabase.co",
    supabaseAnonKey: process.env.NUXT_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2d256dmhyc3N0cW1mdHljZWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTIxOTQsImV4cCI6MjA3Nzk4ODE5NH0.oj5MaPSsEpjjREYqjTs9BJl6VgTxc3NIabVG3rRBm8Y",
  },
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: "/",
    head: {
      htmlAttrs: {
        lang: "en",
      },
    },
    pageTransition: { name: "page", mode: "out-in" },
  },
  site: {
    url: runtimeConfig.public.siteBaseUrl,
    name: siteConfig.siteTitle,
  },
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  runtimeConfig,
  modules: ["@nuxtjs/sanity", "lenis/nuxt", "nuxt-umami", "@nuxtjs/sitemap"],
  sanity: {
    projectId: siteConfig.projectId,
  },
  css: ["~/assets/scss/main.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: hoistUseStatements(
            `@import "~/assets/scss/_style-resources.scss";`
          ),
          quietDeps: true,
          api: "modern-compiler", // silence deprecation warnings https://github.com/sass/dart-sass/issues/2280
          // For now, just silence the deprecation warning.
          // But we have to use Dart Sass modern API https://sass-lang.com/documentation/breaking-changes/legacy-js-api/ soon.
          // Vite 5.x uses the legacy API as default https://vitejs.dev/config/shared-options.html#css-preprocessoroptions
          // Probably for best performance we should use `api: "modern-compiler"` and `sass-embedded` package.
          // Waiting on Vite fixing the missing sourcemap files https://github.com/vitejs/vite/pull/18113 warning.
          silenceDeprecations: [
            "mixed-decls",
            "color-functions",
            "import",
            "global-builtin",
          ],
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("gpu-curtains")) {
              return "gpu-curtains";
            }
          },
        },
      },
    },
  },
  components: [
    "~/components/atoms",
    "~/components/molecules",
    "~/components/organisms",
    "~/components/academy",
    "~/components/shared",
  ],
  // https://umami.nuxt.dev/getting-started/installation
  umami: {
    id: runtimeConfig.umamiId,
    host: runtimeConfig.umamiHost,
    autoTrack: true,
    ...(runtimeConfig.public.siteDomain && {
      domains: [runtimeConfig.public.siteDomain],
    }),
  },
});
