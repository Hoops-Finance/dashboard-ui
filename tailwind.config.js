module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lora: ['Lora', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        yellow: {
          DEFAULT: '#F7D423',
        },
        black: {
          DEFAULT: '#0F0F0F',
        },
        purple: {
          DEFAULT: '#B7A7E5',
        },
      },
    },
  },
  plugins: [],
}