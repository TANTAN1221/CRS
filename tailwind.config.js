/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        portal: {
          navy: '#0e2756',
          deep: '#0a1b3d',
          accent: '#183d84',
          hover: '#122850',
        },
      },
    },
  },
  plugins: [],
};
