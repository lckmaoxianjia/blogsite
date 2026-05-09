import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: "#2563eb",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      maxWidth: {
        article: "720px",
      },
    },
  },
  plugins: [],
};

export default config;
