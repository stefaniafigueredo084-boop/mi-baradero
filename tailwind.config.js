/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "Verde Tranqui" (misma estructura que Azul Río, en verde suave)
        primario: '#3D8B68',
        'primario-oscuro': '#285E47',
        'primario-suave': '#E0EFE7',
        secundario: '#6AAE4E',
        'secundario-oscuro': '#4B8A33',
        'secundario-suave': '#E7F4DF',
        acento: '#F2B53E',
        'acento-oscuro': '#C98A12',
        tinta: '#1D3328',
        'fondo-app': '#F1F6F3',
      },
      // Redondeo contenido: lo más redondo del sitio es suave, no "burbuja"
      borderRadius: {
        xl: '0.625rem',
        '2xl': '0.75rem',
        '3xl': '0.75rem',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
