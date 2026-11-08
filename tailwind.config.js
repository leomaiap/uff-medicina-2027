/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./**/*.html"],
  theme: {
    extend: {
      colors: {
        facmed: {
          primary: '#006843',   // Verde Solene UFF
          dark: '#004d32',      // Verde Escuro Institucional
          surface: '#FAFAF9',   // Fundo Claro Editorial (Warm White / Stone)
          card: '#FFFFFF',      // Branco Puro para Cartões e Fichas
          accent: '#006843',
          subtle: '#F0FDF4',    // Verde muito suave para badges informativos
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
