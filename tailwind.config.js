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
        sans: ['"Noto Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Noto Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
