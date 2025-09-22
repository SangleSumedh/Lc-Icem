/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af', // Professional blue
        secondary: '#f8fafc', // Light gray
        accent: '#3b82f6', // Bright blue accent
      },
    },
  },
  plugins: [],
}
