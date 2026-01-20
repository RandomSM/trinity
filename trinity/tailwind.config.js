import daisyui from "daisyui";


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6F00", // Orange OpenFoodFacts
        secondary: "#FF8F00", // Orange clair
        accent: "#52B46B", // Vert OpenFoodFacts
        danger: "#DC2626", // Red
        offOrange: "#FF6F00",
        offGreen: "#52B46B",
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark"], // Optional: supports dark mode
  },
};
