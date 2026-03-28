/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: "#F5EDE3",
        blush: "#F4E1D2",
        lavender: "#E8E0F0",
        sage: "#D4E2D3",
        charcoal: "#2D2D2D",
        smoke: "#6B6B6B",
        cloud: "#FAFAFA",
      },
      borderRadius: {
        card: "20px",
      },
      fontFamily: {
        heading: ["PlayfairDisplay_700Bold"],
        body: ["Inter_400Regular"],
        "body-medium": ["Inter_500Medium"],
        "body-bold": ["Inter_600SemiBold"],
      },
    },
  },
  plugins: [],
};
