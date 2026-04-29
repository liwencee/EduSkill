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
        heading: ['var(--font-jakarta)', 'sans-serif'],
        sans:    ['var(--font-nunito)',  'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn .4s ease-in-out',
        'slide-up':   'slideUp .4s ease-out',
        'float':      'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },                              '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(16px)' },'100%': { opacity: '1', transform: 'translateY(0)' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' },         '50%': { transform: 'translateY(-12px)' } },
        pulseGlow: { '0%, 100%': { opacity: '1' },                         '50%': { opacity: '.5' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' },             '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'clay':        '8px 8px 20px rgba(55,138,221,0.15), -4px -4px 12px rgba(255,255,255,0.8)',
        'clay-amber':  '8px 8px 20px rgba(239,159,39,0.2),  -4px -4px 12px rgba(255,255,255,0.8)',
        'clay-green':  '8px 8px 20px rgba(16,185,129,0.15), -4px -4px 12px rgba(255,255,255,0.8)',
        'glass':       '0 8px 32px rgba(30,79,138,0.12)',
      },
    },
  },
  plugins: [],
}
export default config
