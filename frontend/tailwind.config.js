/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#12291F',
          dark: '#0B1A14',
          light: '#1B3B2C',
        },
        parchment: {
          DEFAULT: '#F3EAD8',
          dark: '#E8DAC0',
        },
        gold: {
          DEFAULT: '#C9A24B',
          dark: '#A9843A',
        },
        offwhite: '#FAF7F0',
        charcoal: '#1C1C1A',
        ember: '#B8433A',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
