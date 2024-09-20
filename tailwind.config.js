module.exports = {
  darkMode: "class", // Enable class-based dark mode
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        lora: ["Lora", "serif"],
        inter: ["Inter", "sans-serif"]
      },
      colors: {
        yellow: {
          DEFAULT: "#F7D423"
        },
        black: {
          DEFAULT: "#0F0F0F"
        },
        purple: {
          DEFAULT: "#B7A7E5"
        }
      },
      screens: {
        mobile: { max: "480px" },
        "mobile-landscape": { max: "768px" },
        tablet: { max: "843px" },
        "tablet-landscape": { max: "1024px" },
        laptop: { max: "1440px" },
        desktop: { max: "1440px" }
      }
    }
  },
  plugins: []
};
