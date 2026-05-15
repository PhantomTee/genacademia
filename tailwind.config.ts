import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Off-white (replaces yellow in the Mammoth Murals reference)
        cream: {
          50:  "#FDFCF9",
          100: "#F9F6EF",
          200: "#F3EDE0",
          300: "#EDE3D0",
          DEFAULT: "#F3EDE0",
        },
        ink: {
          DEFAULT: "#0D0C0A",
          soft: "#1A1915",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
