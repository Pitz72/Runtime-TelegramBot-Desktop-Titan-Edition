/**
 * Design system «Titan Blue» (2.4).
 *
 * I colori vengono tutti da src/renderer/src/theme/palette.json, la stessa fonte che
 * scripts/check-contrast.mjs misura contro WCAG 2.2 AA: un colore che non regge il
 * contrasto non entra. Nei componenti si usano solo questi nomi semantici, mai un esadecimale.
 *
 * Regola per le trasparenze: `/NN` va bene per sfondi decorativi e bordi, MAI per il colore
 * di un testo o per lo sfondo su cui sta del testo — il controllo del contrasto non le vede.
 * Per gli stati selezionati c'è `surface-4`, per gli avvisi i `*-soft`.
 */
const { colors } = require('./src/renderer/src/theme/palette.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Fira Code Variable"', '"Fira Code"', 'ui-monospace', 'Consolas', 'monospace'],
      },
      // Scala tipografica di un'app desktop densa: il corpo è 14px, niente sotto i 12px.
      // L'ingrandimento dell'interfaccia (Impostazioni → Accessibilità) scala tutto.
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '20px' }],
        base: ['14px', { lineHeight: '22px' }],
        md: ['15px', { lineHeight: '22px' }],
        lg: ['17px', { lineHeight: '24px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        // Ombre morbide e corte: l'elevazione si legge, non si vede «brillare».
        raised: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 1px 2px rgba(0,0,0,0.35)',
        overlay: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 24px 48px -12px rgba(0,0,0,0.6), 0 8px 16px -8px rgba(0,0,0,0.5)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
