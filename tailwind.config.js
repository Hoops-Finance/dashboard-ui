// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable dark mode using 'class' strategy
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lora: ['Lora', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#E2BE08',
        text: '#ffffff',
        header: '#444444',
        bg: '#1b1b1b',
        'nav-bg': '#2b2b2b',
        'nav-text': '#B7A7E5',
        'nav-hover-bg': '#3b3b3b',
        'nav-hover-text': '#ffffff',
        'nav-accent': '#E2BE08',
        'nav-accent-text': '#ffffff',
        'btn-primary-border': '#B7A7E5',
        yellow: {
          DEFAULT: '#F7D423',
        },
        black: {
          DEFAULT: '#0F0F0F',
        },
        purple: {
          DEFAULT: '#B7A7E5',
        },
        // Additional colors for light mode
        'light-bg': '#ffffff',
        'light-text': '#000000',
      },
      screens: {
        'mobile': { 'max': '480px' },
        'mobile-landscape': { 'max': '768px' },
        'tablet': { 'max': '843px' },
        'tablet-landscape': { 'max': '1024px' },
        'laptop': { 'max': '1440px' },
        'desktop': { 'max': '1440px' },
      },
    },
  },
  plugins: [],
};
