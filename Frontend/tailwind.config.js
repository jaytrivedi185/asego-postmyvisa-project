/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#002962',
          light: '#f5f8ff',
          muted: 'rgba(0, 41, 98, 0.65)',
          subtle: 'rgba(0, 41, 98, 0.08)',
        },
        gold: {
          DEFAULT: '#f2c45a',
          light: 'rgba(242, 196, 90, 0.16)',
          hover: '#e7b84e',
        },
      },
    },
  },
  plugins: [],
}
