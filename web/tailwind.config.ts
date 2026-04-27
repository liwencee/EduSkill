import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // 60% — dominant background (warm cream)
          bg:     '#F1EFE8',
          bgAlt:  '#E8E5DC',
          // 30% — structural colour (blue: nav, headings, sections)
          blue:   '#378ADD',
          blueDark: '#1e4f8a',
          blueLight: '#EBF4FF',
          // 10% — accent / CTA (amber: buttons, highlights)
          amber:  '#EF9F27',
          amberDark: '#C97E0A',
          // Text
          ink:    '#2C2C2A',
          inkMid: '#5A5A58',
          inkLight: '#9A9A97',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn .4s ease-in-out',
        'slide-up': 'slideUp .4s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
