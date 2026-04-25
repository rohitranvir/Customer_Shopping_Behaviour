/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary Blue palette (OkCredit-inspired)
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // MAIN
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Success green for credit
        credit: {
          DEFAULT: '#16a34a',
          light: '#dcfce7',
          dark: '#14532d',
        },
        // Danger red for debit
        debit: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
          dark: '#7f1d1d',
        },
        // App surfaces
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          card: '#ffffff',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
          light: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
