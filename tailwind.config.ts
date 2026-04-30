import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#eef8ff',
        panel: '#f7fbff',
        line: '#2f7fb3',
      },
      boxShadow: {
        glow: '0 0 30px rgba(216, 156, 57, 0.22)',
      },
    },
  },
  plugins: [],
} satisfies Config;
