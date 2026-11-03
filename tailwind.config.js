/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: '#241675', deep: '#160D4F', soft: '#E2DEF5', mist: '#F4F2FA' },
        gold: { DEFAULT: '#E8A33D', deep: '#96600A', soft: '#FBEBD3' },
        ink: { DEFAULT: '#1B1838', muted: '#5B5873', line: '#E2E3EC' },
        paper: '#F3F4F8',
        signal: { DEFAULT: '#FF6A3D', deep: '#D94A1F' },
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
