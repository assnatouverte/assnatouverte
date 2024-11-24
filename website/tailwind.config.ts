import type { Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    fontFamily: {
      "sans": ["IBM Plex Sans", "sans-serif"],
    },
  },
} satisfies Config;
