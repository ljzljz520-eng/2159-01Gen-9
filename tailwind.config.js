/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        fountain: {
          bg: '#0a0e1a',
          cyan: '#00d4ff',
          violet: '#7b61ff',
          surface: 'rgba(10, 14, 26, 0.7)',
        },
      },
    },
  },
  plugins: [],
};
