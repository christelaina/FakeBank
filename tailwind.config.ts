import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7f4",
          100: "#dceee5",
          200: "#bbddd0",
          300: "#8dc5b2",
          400: "#5aa690",
          500: "#3a8a74",
          600: "#2b6f5d",
          700: "#24594c",
          800: "#1f483e",
          900: "#1b3c35",
          950: "#0d221e",
        },
        surface: {
          DEFAULT: "#f7f8f7",
          elevated: "#ffffff",
          muted: "#eef1ef",
          border: "#d9e0db",
        },
      },
      fontFamily: {
        sans: ["var(--font-source-sans)", "Segoe UI", "sans-serif"],
        display: ["var(--font-source-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 20, 0.04), 0 4px 12px rgba(15, 23, 20, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
