/** Tailwind v4 config (ESM). */
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{svelte,js,ts}"],
  theme: {
    extend: {},
  },
  plugins: [forms, typography],
};
