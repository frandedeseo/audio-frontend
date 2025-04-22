/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // add other directories if needed
  ],
  safelist: [
    // text colors
    "text-red-800",
    "text-yellow-800",
    "text-green-800",
    "text-blue-800",
    "text-gray-800",
    // background colors
    "bg-red-100",
    "bg-yellow-100",
    "bg-green-100",
    "bg-blue-100",
    "bg-gray-100",
    // hover background colors
    "hover:bg-red-100",
    "hover:bg-yellow-100",
    "hover:bg-green-100",
    "hover:bg-blue-100",
    "hover:bg-gray-100",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
