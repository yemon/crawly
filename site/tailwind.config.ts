import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#141414',
        paper: '#ffffff',
        hero: '#e02f2f',
        heroBlue: '#2a49c8',
      },
      fontFamily: {
        bang: ['var(--font-bangers)', '"Comic Sans MS"', 'cursive'],
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        pop: '3px 3px 0 #141414',
        popLg: '4px 4px 0 #141414',
        popSoft: '4px 4px 0 rgba(20,20,20,0.35)',
      },
      maxWidth: {
        prose: '65ch',
      },
    },
  },
  plugins: [],
};

export default config;
