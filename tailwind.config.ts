import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts}',
  ],
  safelist: [
    'from-fuchsia-500',
    'via-rose-400',
    'to-orange-300',
    'from-fuchsia-50',
    'to-orange-50',
    'from-indigo-500',
    'via-sky-400',
    'to-cyan-300',
    'from-indigo-50',
    'to-cyan-50',
    'from-emerald-400',
    'via-teal-400',
    'to-sky-400',
    'from-emerald-50',
    'to-sky-50',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#17131f',
          green: '#5bb8ff',
          bg: '#fbf7ff',
          text: '#19151f',
        },
      },
      backgroundImage: {
        aurora:
          'radial-gradient(circle at 18% 10%, #fff338 0, #fff338 14%, transparent 32%), radial-gradient(circle at 74% 25%, #ff7418 0, #ff7418 23%, transparent 48%), radial-gradient(circle at 75% 57%, #f31323 0, #f31323 22%, transparent 46%), radial-gradient(circle at 19% 58%, #c72991 0, #c72991 23%, transparent 42%), linear-gradient(135deg, #ffe935 0%, #fa4f1b 38%, #f31524 62%, #c92a95 100%)',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
