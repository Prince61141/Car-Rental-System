// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        scrollX: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        scrollXReverse: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      animation: {
        "scroll-x": "scrollX 30s linear infinite",
        "scroll-x-reverse": "scrollXReverse 30s linear infinite",
      },
    },
  },
  plugins: [],
};
