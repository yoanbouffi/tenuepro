/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: '#241675', deep: '#160D4F', soft: '#E2DEF5', mist: '#F4F2FA' },
        gold: { DEFAULT: '#E8A33D', deep: '#96600A', soft: '#FBEBD3' },
        ink: { DEFAULT: '#2A2740', muted: '#5E5A78', line: '#DCD8EA' },
        paper: '#FAF8F4',
        // anciennes couleurs, conservées pour l'admin
        brand: { red: '#E63946', black: '#1a1a1a', gray: '#f5f5f5' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Archivo', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1200px' },
    },
  },
  plugins: [],
}
