import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        foreground: "var(--ink)",

        primary:   { DEFAULT: "#0A2540", light: "rgba(10,37,64,0.06)", muted: "rgba(10,37,64,0.4)" },
        deep:      "#102A72",
        secondary: { DEFAULT: "#102A72", alt: "#1E3A8A", light: "#E6EEFF", lighter: "#F1F5FF" },
        lens:      { DEFAULT: "#5B8CFF", soft: "#E6EEFF", tint: "#F1F5FF" },
        honey:     { DEFAULT: "#F5C96A", soft: "#FFF4D6" },
        accent:    { DEFAULT: "#F5A524", alt: "#F59E0B", light: "#FFF4D6", dark: "#8A6300" },

        ink:    "#0F172A",
        muted:  "#64748B",
        subtle: "#475569",
        slate:  "#64748B",

        surface: "#F4F6F9",
        paper:   "#FFFFFF",
        border:  "#E2E8F0",
        line:    "#E2E8F0",
        "line-soft": "#EEF2F6",

        success: { DEFAULT: "#10B981", dark: "#065F46", light: "#D1FAE5" },
        bad:     "#EF4444",
      },
      fontSize: {
        "2xs":     ["9px",  { lineHeight: "1.4" }],
        "xs":      ["10px", { lineHeight: "1.4" }],
        "sm":      ["11px", { lineHeight: "1.5" }],
        "base-sm": ["12px", { lineHeight: "1.5" }],
        "base":    ["13px", { lineHeight: "1.6" }],
        "md":      ["14px", { lineHeight: "1.5" }],
        "lg-sm":   ["15px", { lineHeight: "1.5" }],
        "lg":      ["16px", { lineHeight: "1.5" }],
        "lg-alt":  ["17px", { lineHeight: "1.4" }],
        "xl":      ["18px", { lineHeight: "1.4" }],
        "2xl":     ["22px", { lineHeight: "1.3" }],
        "3xl":     ["24px", { lineHeight: "1.3" }],
        "4xl":     ["28px", { lineHeight: "1.2" }],
        "5xl":     ["30px", { lineHeight: "1.2" }],
        "6xl":     ["32px", { lineHeight: "1.1" }],
        "7xl":     ["40px", { lineHeight: "1.1" }],
        "display": ["64px", { lineHeight: "1" }],
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono:  ['"JetBrains Mono"', '"SF Mono"', "Menlo", "ui-monospace", "monospace"],
        serif: ["Times", "serif"],
      },
      boxShadow: {
        "card":   "0 1px 2px rgba(10,37,64,.05), 0 0 0 1px rgba(10,37,64,.04)",
        "panel":  "0 8px 28px -10px rgba(10,37,64,.18), 0 2px 6px rgba(10,37,64,.05)",
        "modal":  "0 24px 60px -20px rgba(10,37,64,.30)",
        "sheet":  "0 -10px 40px -10px rgba(10,37,64,.18)",
        "focus":  "0 0 0 4px #F1F5FF",
        "button": "0 8px 22px -8px rgba(16,42,114,.55)",
        "side":   "-4px 0 24px rgba(10,37,64,.12)",
      },
      borderRadius: {
        "pill":  "999px",
        "card":  "20px",
        "xl":    "12px",
        "2xl":   "24px",
        "badge": "8px",
        "sm":    "6px",
        "tag":   "10px",
        "sheet": "28px",
      },
    },
  },
  plugins: [],
};

export default config;
