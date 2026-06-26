/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'rgba(11, 28, 49, 1)',
          light: 'rgba(11, 28, 49, 0.85)',
          muted: 'rgba(11, 28, 49, 0.5)',
          subtle: 'rgba(11, 28, 49, 0.08)',
        },
        gold: {
          DEFAULT: 'rgba(250, 199, 77, 1)',
          light: 'rgba(250, 199, 77, 0.2)',
          hover: 'rgba(250, 199, 77, 0.85)',
        },
      },
    },
  },
  plugins: [],
}
