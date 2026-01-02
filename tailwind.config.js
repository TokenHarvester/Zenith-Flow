/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zenith-purple': '#6B46C1',
        'zenith-cyan': '#00D1D1'
      },
    },
  },
  plugins: [],
}

