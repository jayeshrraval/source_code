/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: '#9FD7C1',
        'deep-blue': '#0B4F6C',
        'royal-gold': '#D4AF37',
      },
      fontFamily: {
        gujarati: ["'Noto Sans Gujarati'", 'sans-serif'],
        inter: ["'Inter'", 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.875rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'mint': '0 4px 12px rgba(159, 215, 193, 0.15)',
        'gold': '0 4px 12px rgba(212, 175, 55, 0.15)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
