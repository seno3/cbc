/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: '#00ff41',
        'neon-dim': '#00cc33',
        'neon-blue': '#00b4ff',
        bg: '#0a0a0a',
        surface: '#111111',
        card: '#151515',
        border: '#222222',
        muted: '#333333',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'slide-left': 'slideLeft 0.3s ease-out forwards',
        'slide-right': 'slideRight 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pop': 'pop 0.15s ease-out',
      },
      keyframes: {
        slideLeft: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(-120%) rotate(-15deg)', opacity: '0' },
        },
        slideRight: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(120%) rotate(15deg)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
