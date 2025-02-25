/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6CD9CA',
        accent1: '#9b252f',
        accent2: '#b65441',
        accent3: '#d07e59',
        accent4: '#e5a979',
        accent5: '#f4d79e',
        accent6: '#fcfdc1',
        accent7: '#cdddb5',
        accent8: '#9dbda9',
        accent9: '#729d9d',
        accent10: '#4f7f8b',
        accent11: '#34687e',
      },
      fontFamily: {
        nunito: ['var(--font-nunito)', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in forwards',
      },
    },
  },
  plugins: [],
}