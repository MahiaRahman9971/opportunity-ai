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
        'primary-dark': '#4eb8a9',
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
        fadeIn: 'fadeIn 0.5s ease-in forwards',
        bounce: 'bounce 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' }
        }
      },
    },
  },
  plugins: [],
}