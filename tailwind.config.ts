import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fsl: {
          navy: "#0f172a",
          blue: {
            DEFAULT: "#1d4ed8",
            light: "#3b82f6",
            dark: "#1e40af",
            50: "#eff6ff",
            100: "#dbeafe",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
          },
          amber: {
            DEFAULT: "#d97706",
            light: "#f59e0b",
            dark: "#b45309",
            50: "#fffbeb",
            100: "#fef3c7",
          },
          emerald: {
            DEFAULT: "#059669",
            light: "#10b981",
            dark: "#047857",
            50: "#ecfdf5",
            100: "#d1fae5",
          },
          rose: {
            DEFAULT: "#e11d48",
            light: "#f43f5e",
            dark: "#be123c",
            50: "#fff1f2",
            100: "#ffe4e6",
          },
          slate: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
            950: "#020617",
          }
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
