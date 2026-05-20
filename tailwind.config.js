/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Interactif (cyan) ── */
        accent:        '#00D4FF',
        'accent-dark': '#0099BB',

        /* ── Institutionnel (or) ── */
        or:            '#C8B89A',
        'or-profond':  '#A89070',

        /* ── Fonds dark ── */
        'dark-bg':      '#111111',
        'dark-surface': '#1C1C1C',
        'dark-border':  '#2E2E2E',

        /* ── Fonds light ── */
        'light-bg':      '#F5F5F2',
        'light-surface': '#FFFFFF',
        'light-border':  '#E0E0E0',

        /* ── Textes ── */
        'dark-text':      '#CCCCCC',
        'light-text':     '#111111',
        'text-secondary': '#888888',
        'text-muted':     '#555555',
      },
      fontFamily: {
        /* Charte DeckTrain */
        'display': ['Cormorant Garamond', 'Georgia', 'serif'],
        'sans':    ['DM Sans', 'Arial', 'sans-serif'],
        'mono':    ['JetBrains Mono', 'Courier New', 'monospace'],
        /* Aliases */
        'serif':   ['Cormorant Garamond', 'Georgia', 'serif'],
        'body':    ['DM Sans', 'Arial', 'sans-serif'],
        'code':    ['JetBrains Mono', 'Courier New', 'monospace'],
        /* Legacy mappings — anciens noms maintenus pour les classes existantes */
        'syne':    ['Cormorant Garamond', 'Georgia', 'serif'],
        'inter':   ['DM Sans', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float:        'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,212,255,0.3)' },
          '50%':      { boxShadow: '0 0 28px rgba(0,212,255,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
