/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'g-dark': '#081208',
        'g-mid': '#0d1f0d',
        'g-green': '#1a3d1a',
        'g-accent': '#2ecc71',
        'g-bright': '#4fffb0',
        'g-gold': '#c9a84c',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      }
    }
  },
  plugins: []
}
