/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sandal: {
          50: '#FAF7F2',
          100: '#F5F0E6',
          200: '#E8DEC9',
          300: '#D9C7A3',
          400: '#C7AE7A',
          500: '#B8945A',
          600: '#A67C45',
          700: '#8A6338',
          800: '#6F4E2E',
          900: '#5D4037',
          950: '#3E2A22',
        },
        gold: {
          50: '#FDF8EC',
          100: '#FAEFCE',
          200: '#F3DE9B',
          300: '#E9C966',
          400: '#DDB441',
          500: '#C9A96E',
          600: '#B08E4D',
          700: '#8E703C',
          800: '#755C34',
          900: '#634D2E',
        },
        ink: {
          50: '#F7F7F7',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#6D6D6D',
          600: '#5D5D5D',
          700: '#4F4F4F',
          800: '#2C2C2C',
          900: '#1A1A1A',
          950: '#0F0F0F',
        },
        bamboo: {
          50: '#F3F9EC',
          100: '#E3F2D3',
          200: '#C8E5A9',
          300: '#A6D478',
          400: '#88C24E',
          500: '#7CB342',
          600: '#5C8A2E',
          700: '#466A25',
          800: '#3A5622',
          900: '#32491F',
        },
      },
      fontFamily: {
        song: ['"Noto Serif SC"', '"Source Han Serif SC"', '"SimSun"', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(93, 64, 55, 0.08)',
        'card': '0 4px 20px rgba(93, 64, 55, 0.1)',
        'elevated': '0 8px 32px rgba(93, 64, 55, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
