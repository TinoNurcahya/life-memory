import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: {
          DEFAULT: "var(--color-surface)",
          subdued: "var(--color-surface-subdued)",
          elevated: "var(--color-surface-elevated)",
        },
        border: {
          hairline: "var(--color-border-hairline)",
          strong: "var(--color-border-strong)",
        },
        foreground: "var(--color-text-foreground)",
        muted: "var(--color-text-muted)",
        faint: "var(--color-text-faint)",
        brand: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        accent: {
          gold: "var(--color-accent-gold)",
        },
        sidebar: {
          DEFAULT: "var(--color-sidebar-bg)",
          surface: "var(--color-sidebar-surface)",
          border: "var(--color-sidebar-border)",
        },
        cat: {
          learning: {
            bg: "var(--cat-learning-bg)",
            text: "var(--cat-learning-text)",
            border: "var(--cat-learning-border)",
          },
          career: {
            bg: "var(--cat-career-bg)",
            text: "var(--cat-career-text)",
            border: "var(--cat-career-border)",
          },
          health: {
            bg: "var(--cat-health-bg)",
            text: "var(--cat-health-text)",
            border: "var(--cat-health-border)",
          },
          social: {
            bg: "var(--cat-social-bg)",
            text: "var(--cat-social-text)",
            border: "var(--cat-social-border)",
          },
          leisure: {
            bg: "var(--cat-leisure-bg)",
            text: "var(--cat-leisure-text)",
            border: "var(--cat-leisure-border)",
          },
          routine: {
            bg: "var(--cat-routine-bg)",
            text: "var(--cat-routine-text)",
            border: "var(--cat-routine-border)",
          },
          other: {
            bg: "var(--cat-other-bg)",
            text: "var(--cat-other-text)",
            border: "var(--cat-other-border)",
          },
        },
        entity: {
          person: {
            bg: "var(--entity-person-bg)",
            text: "var(--entity-person-text)",
            border: "var(--entity-person-border)",
          },
          place: {
            bg: "var(--entity-place-bg)",
            text: "var(--entity-place-text)",
            border: "var(--entity-place-border)",
          },
          topic: {
            bg: "var(--entity-topic-bg)",
            text: "var(--entity-topic-text)",
            border: "var(--entity-topic-border)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "shimmer-slide": "shimmer-slide 2s linear infinite",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "shimmer-slide": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
