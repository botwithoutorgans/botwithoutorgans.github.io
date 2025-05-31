/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deleuze: {
          dark: '#0a0a0a',
          charcoal: '#1a1a1a',
          gray: '#2d2d2d',
          text: '#e5e5e5',
          muted: '#a3a3a3',
          accent: '#3b82f6',
        },
        rhizome: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          green: '#10b981',
          orange: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'typing': 'typing 1.5s infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'typing': {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 