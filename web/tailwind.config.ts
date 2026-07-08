import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  safelist: [
    'shadow-clay-blue', 'shadow-clay-orange', 'shadow-clay-green',
    'border-blue-200', 'border-orange-200', 'border-green-200',
    'border-pink-200', 'border-yellow-200', 'border-teal-200',
    'bg-orange-100', 'bg-blue-100', 'bg-pink-100', 'bg-yellow-100', 'bg-green-100', 'bg-teal-100',
    'text-orange-700', 'text-blue-700', 'text-pink-700', 'text-yellow-700', 'text-green-700', 'text-teal-700',
    'bg-orange-500', 'bg-blue-500', 'bg-pink-500', 'bg-yellow-500', 'bg-green-500', 'bg-teal-500',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:        '#F1EFE8',
          bgAlt:     '#E8E5DC',
          blue:      '#378ADD',
          blueDark:  '#1e4f8a',
          blueLight: '#EBF4FF',
          amber:     '#F37321',
          amberDark: '#C97E0A',
          ink:       '#2C2C2A',
          inkMid:    '#5A5A58',
          inkLight:  '#9A9A97',
        },
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'sans-serif'],
        sans:    ['var(--font-nunito)',  'sans-serif'],
      },
      boxShadow: {
        'clay':         '0 8px 0 rgba(0,0,0,0.10), 0 4px 20px rgba(0,0,0,0.07)',
        'clay-sm':      '0 4px 0 rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.07)',
        'clay-lg':      '0 12px 0 rgba(0,0,0,0.10), 0 8px 30px rgba(0,0,0,0.08)',
        'clay-blue':    '0 8px 0 rgba(55,138,221,0.25), 0 4px 20px rgba(55,138,221,0.10)',
        'clay-orange':  '0 8px 0 rgba(243,115,33,0.30), 0 4px 20px rgba(243,115,33,0.12)',
        'clay-green':   '0 8px 0 rgba(34,197,94,0.30),  0 4px 20px rgba(34,197,94,0.12)',
        'clay-purple':  '0 8px 0 rgba(168,85,247,0.25), 0 4px 20px rgba(168,85,247,0.10)',
        'glass':        '0 8px 32px rgba(30,79,138,0.12)',
      },
      animation: {
        'fade-in':    'fadeIn .4s ease-in-out',
        'slide-up':   'slideUp .4s ease-out',
        'float':      'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },                               '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(16px)' },'100%': { opacity: '1', transform: 'translateY(0)' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' },          '50%': { transform: 'translateY(-10px)' } },
        pulseGlow: { '0%, 100%': { opacity: '1' },                          '50%': { opacity: '.6' } },
      },
    },
  },
  plugins: [],
}
export default config
