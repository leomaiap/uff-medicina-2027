/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./**/*.html"],
  theme: {
    extend: {
      colors: {
        facmed: {
          primary: '#006843',
          dark: '#014237',
          darker: '#00261f',
          accent: '#009E5E',
          light: '#E8F5E9',
          surface: '#F8FAFC',
          gold: '#FACC15',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'emerald-glow': '0 0 35px -5px rgba(0, 158, 94, 0.45)',
        'gold-glow': '0 0 25px -5px rgba(250, 204, 21, 0.35)',
      }
    },
  },
  plugins: [],
}
