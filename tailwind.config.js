/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        phase: {
          r: '#EF4444', // Red Phase
          y: '#F59E0B', // Yellow Phase
          b: '#3B82F6', // Blue Phase
        },
        industrial: {
          900: '#0B1120',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
          border: '#1E293B',
          card: '#111827',
          sidebar: '#0A0F1D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}

