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
        // Base
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Brand — extracted from design tokens (by frequency)
        primary: {
          DEFAULT: "#0A2540", // rgb(10,37,64) — navy, headings & main text (441 uses)
          light: "rgba(10,37,64,0.06)",
          muted: "rgba(10,37,64,0.4)",
          strong: "rgba(10,37,64,0.92)",
        },
        secondary: {
          DEFAULT: "#1D278B", // rgb(29,39,139) — royal blue, CTAs (124 uses)
          alt: "#1E3A8A",    // rgb(30,58,138) — slight variant used in buttons
          light: "#EEEFFC",  // rgb(238,239,252) — blue-tinted bg
          lighter: "#EEF2FF", // rgb(238,242,255) — indigo-50-like
        },
        accent: {
          DEFAULT: "#F5A524", // rgb(245,165,36) — amber, warnings & partial match (111 uses)
          alt: "#F59E0B",     // rgb(245,158,11) — amber variant
          light: "#FEF3C7",   // rgb(254,243,199) — amber-100
          dark: "#92400E",    // rgb(146,64,14) — amber-800
        },

        // Neutrals
        ink: "#0A0A0A",         // rgb(10,10,10) — near-black body text (651 uses)
        muted: "#64748B",       // rgb(100,116,139) — secondary text, icons (266 uses)
        subtle: "#475569",      // rgb(71,85,105) — slate-600

        // Surfaces & borders
        surface: "#F4F6F9",     // rgb(244,246,249) — page background (57 uses)
        border: "#E2E8F0",      // rgb(226,232,240) — card borders, dividers (88 uses)

        // Semantic states
        success: {
          DEFAULT: "#10B981",   // rgb(16,185,129) — emerald (8 uses)
          dark: "#065F46",      // rgb(6,95,70) — emerald-800 (10 uses)
          light: "#D1FAE5",     // rgb(209,250,229) — emerald-100 (5 uses)
        },
      },

      fontSize: {
        // Mapped from design token fontSizes (ordered by semantic role)
        "2xs": ["9px",  { lineHeight: "1.4" }],
        "xs":  ["10px", { lineHeight: "1.4" }],
        "sm":  ["11px", { lineHeight: "1.5" }],
        "base-sm": ["12px", { lineHeight: "1.5" }],
        "base": ["13px", { lineHeight: "1.6" }],  // dominant UI text (146 uses)
        "md":  ["14px", { lineHeight: "1.5" }],
        "lg-sm": ["15px", { lineHeight: "1.5" }],
        "lg":  ["16px", { lineHeight: "1.5" }],   // browser default (395 uses)
        "lg-alt": ["17px", { lineHeight: "1.4" }],
        "xl":  ["18px", { lineHeight: "1.4" }],
        "2xl": ["22px", { lineHeight: "1.3" }],
        "3xl": ["24px", { lineHeight: "1.3" }],
        "4xl": ["28px", { lineHeight: "1.2" }],
        "5xl": ["30px", { lineHeight: "1.2" }],
        "6xl": ["32px", { lineHeight: "1.1" }],
        "7xl": ["40px", { lineHeight: "1.1" }],
        "display": ["64px", { lineHeight: "1" }],
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        serif: ["Times", "serif"],
        mono: ["ui-monospace", '"SF Mono"', "Menlo", "monospace"],
      },

      boxShadow: {
        // From design token shadows
        "card": "rgba(10,37,64,0.06) 0px 1px 2px 0px",
        "panel": "rgba(10,37,64,0.1) 0px 6px 20px 0px",
        "modal": "rgba(10,37,64,0.14) 0px 12px 32px 0px",
        "sheet": "rgba(10,37,64,0.12) 0px -4px 32px 0px",
        "focus": "rgb(226,232,240) 0px 0px 0px 2px",
        "button": "rgba(30,58,138,0.35) 0px 6px 16px 0px",
        "side": "rgba(10,37,64,0.08) -4px 0px 24px 0px",
      },

      borderRadius: {
        // From design token borderRadii
        "pill": "999px",
        "card": "20px",
        "xl": "12px",
        "2xl": "24px",
        "badge": "8px",
        "sm": "6px",
        "tag": "10px",
        "sheet": "28px",
      },
    },
  },
  plugins: [],
};

export default config;
