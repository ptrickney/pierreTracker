import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "poop-burst": {
          "0%": {
            transform:
              "translate(-50%, -50%) translate(0, 0) scale(0.25) rotate(0deg)",
            opacity: "0",
          },
          "12%": { opacity: "1" },
          "100%": {
            transform:
              "translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.45) rotate(var(--rot))",
            opacity: "0",
          },
        },
        "poop-hero": {
          "0%, 100%": { transform: "scale(1) rotate(-6deg)" },
          "50%": { transform: "scale(1.2) rotate(6deg)" },
        },
        "celebration-fade": {
          "0%": { opacity: "0" },
          "12%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "poop-burst": "poop-burst 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "poop-hero": "poop-hero 0.45s ease-in-out 4",
        "celebration-fade": "celebration-fade 2.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
