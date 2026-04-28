import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // 60% — dominant background (warm cream)
          bg:        '#F1EFE8',
          bgAlt:     '#E8E5DC',
          // 30% — structural colour (blue: nav, headings, sections)
          blue:      '#378ADD',
          blueDark:  '#1e4f8a',
          blueLight: '#EBF4FF',
          // 10% — accent / CTA (amber: buttons, highlights)
          amber:     '#EF9F27',
          amberDark: '#C97E0A',
          // Text
          ink:       '#2C2C2A',
          inkMid:    '#5A5A58',
          inkLight:  '#9A9A97',
        },
      },
      fontFamily: {
        // Body: Nunito — warm, rounded, friendly (Playful Creative pairing)
        sans:    ['var(--font-nunito)', 'sans-serif'],
        // Headings: Plus Jakarta Sans — modern, clean, SaaS-forward
        heading: ['var(--font-jakarta)', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn .4s ease-in-out',
        'slide-up':   'slideUp .5s ease-out both',
        'float':      'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float:     { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseGlow: { '0%,100%': { opacity: '0.7' }, '50%': { opacity: '1' } },
        shimmer:   { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
      },
    },
  },
  plugins: [],
}
export default config
