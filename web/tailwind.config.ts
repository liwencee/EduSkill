import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  safelist: [
    'shadow-clay-indigo', 'shadow-clay-orange', 'shadow-clay-green',
    'border-indigo-200', 'border-orange-200', 'border-green-200',
    'border-pink-200', 'border-yellow-200', 'border-teal-200',
    'bg-orange-100', 'bg-indigo-100', 'bg-pink-100', 'bg-yellow-100', 'bg-green-100', 'bg-teal-100',
    'text-orange-700', 'text-indigo-700', 'text-pink-700', 'text-yellow-700', 'text-green-700', 'text-teal-700',
    'bg-orange-500', 'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-green-500', 'bg-teal-500',
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
          amber:     '#EF9F27',
          amberDark: '#C97E0A',
          ink:       '#2C2C2A',
          inkMid:    '#5A5A58',
          inkLight:  '#9A9A97',
        },
        edu: {
          primary:   '#4F46E5',
          secondary: '#818CF8',
          cta:       '#F97316',
          bg:        '#EEF2FF',
          text:      '#1E1B4B',
          light:     '#E0E7FF',
        },
      },
      fontFamily: {
        heading: ['var(--font-fredoka)', 'sans-serif'],
        sans:    ['var(--font-nunito)',  'sans-serif'],
      },
      boxShadow: {
        'clay':         '0 8px 0 rgba(0,0,0,0.10), 0 4px 20px rgba(0,0,0,0.07)',
        'clay-sm':      '0 4px 0 rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.07)',
        'clay-lg':      '0 12px 0 rgba(0,0,0,0.10), 0 8px 30px rgba(0,0,0,0.08)',
        'clay-indigo':  '0 8px 0 rgba(79,70,229,0.25),  0 4px 20px rgba(79,70,229,0.10)',
        'clay-orange':  '0 8px 0 rgba(249,115,22,0.30), 0 4px 20px rgba(249,115,22,0.12)',
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
