/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orchestra: {
          300: '#9bd8ff',
          400: '#7c8cff',
          500: '#8b5cf6',
          600: '#6d28d9',
          900: '#111827',
          950: '#070913',
        },
      },
      boxShadow: {
        glow: '0 0 36px rgba(139, 92, 246, 0.34)',
      },
    },
  },
  plugins: [],
};
