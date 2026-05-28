/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F4EFE6',
        ink: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Almarai', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
        sketch: ['Patrick Hand', 'cursive'],
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Almarai', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
