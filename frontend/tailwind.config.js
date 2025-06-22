/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Open Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        amazon: {
          dark: '#131921',
          light: '#232f3e',
          orange: '#ff9900',
          yellow: '#febd69',
          price: '#B12704',
          DEFAULT: '#131921',
          hover: '#485769',
          border: '#ddd',
          background: '#eaeded',
          input: '#f4f4f4',
          footer: '#232F3E',
        },
        text: {
          primary: '#0F1111',
          secondary: '#565959',
          link: '#007185',
          'link-hover': '#C7511F',
        },
        'amazon-blue': '#232F3E',
        'amazon-yellow': '#FF9900',
        'amazon-orange': '#FF9900',
      },
      backgroundColor: {
        primary: '#ffffff',
        secondary: '#f9f9f9',
        tertiary: '#eaeded',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 2s infinite',
      },
      boxShadow: {
        'trust': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 2px 5px rgba(15,17,17,.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
} 