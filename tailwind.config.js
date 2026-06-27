/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          50:  '#f8f8f7',
          100: '#f0efed',
          200: '#e4e2de',
          300: '#ccc9c3',
          900: '#1a1917',
        },
        ink: {
          DEFAULT: '#1a1917',
          soft: '#4a4843',
          muted: '#9a9691',
        },
        accent: '#2D6A4F',
        'accent-light': '#52B788',
        'accent-dim': '#1B4332',
        danger: '#C0392B',
        warn: '#D4A017',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
