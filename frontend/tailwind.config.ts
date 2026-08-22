import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E293B",
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          700: "#1D4ED8",
        },
        secondary: {
          DEFAULT: "#38BDF8",
        },
        accent: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
        },
        gold: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          600: "#D97706",
          700: "#B45309",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        surface: "#F8FAFC",
        border: "#E2E8F0",
        destructive: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-display)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 16px 40px -24px rgba(37, 99, 235, 0.35)",
        soft: "0 10px 28px -18px rgba(15, 23, 42, 0.18)",
        lift: "0 18px 40px -20px rgba(37, 99, 235, 0.4)",
        glass: "0 8px 32px -18px rgba(15, 23, 42, 0.22)",
      },
      spacing: {
        block: "4rem",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
