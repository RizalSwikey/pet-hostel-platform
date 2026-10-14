/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FDFBF7',
        primary: {
          DEFAULT: '#1B382B',
          dark: '#14211A',
          hover: '#142E23',
        },
        terracotta: {
          DEFAULT: '#C86432',
          hover: '#B55527',
        },
        amber: {
          DEFAULT: '#E0A838',
          light: '#FDF6E2',
        },
        line: '#E4DED4',
        pine: '#14211A',
        moss: '#5C6B61',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        stamp: '2px 2px 0px #1B382B',
        'stamp-lg': '4px 4px 0px #1B382B',
        'stamp-terracotta': '2px 2px 0px #C86432',
        subtle: '0 1px 3px rgba(27, 56, 43, 0.06)',
      },
      borderRadius: {
        xs: '2px',
        sm: '3px',
        md: '6px',
      },
    },
  },
  plugins: [],
}
