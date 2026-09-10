/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./games/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        night: "#0B0B0E",
        crimson: "#E60039",
        neon: "#FF007F",
        mist: "#F4F4F6",
        glass: "rgba(255,255,255,0.06)",
      },
    },
  },
  plugins: [],
};
