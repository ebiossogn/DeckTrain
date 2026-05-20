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
        'light-bg':             '#F0EDE8',
        'light-surface':        '#E8E4DE',
        'light-border':         '#C8C4BE',

        /* ── Textes dark ── */
        'dark-text':      '#CCCCCC',
        'text-secondary': '#888888',
        'text-muted':     '#555555',

        /* ── Textes light ── */
        'light-text':           '#1A1A1A',
        'light-text-secondary': '#3D3D3D',
        'light-text-muted':     '#6B6B6B',

        /* ── Accents par mode ── */
        'light-accent': '#0099BB',
        'light-gold':   '#8A7055',
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
