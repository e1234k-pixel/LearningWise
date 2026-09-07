/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // น้ำเงิน
        secondary: '#7C3AED', // ม่วง
        accent: '#14B8A6', // เขียวอมฟ้า
      }
    },
  },
  plugins: [],
}
