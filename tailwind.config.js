/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        titan: ['"Inter"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
        machine: ['"Fira Code"', 'monospace'],
      },
      colors: {
        // ── Obsidian Pulse V2 — Surface Hierarchy ──
        background:                '#12121f',
        'surface-container-lowest': '#0d0d19',
        'surface-container-low':    '#1a1a27',
        'surface-container':        '#1f1e2b',
        'surface-container-high':   '#292936',
        'surface-container-highest':'#343341',
        'surface-variant':          '#343341',
        'surface-dim':              '#12121f',
        'surface-bright':           '#383846',

        // ── Text & Borders ──
        'on-surface':         '#e3e0f3',
        'on-surface-variant': '#c2c6d6',
        'on-background':      '#e3e0f3',
        'outline':            '#8c909f',
        'outline-variant':    '#424754',
        'inverse-surface':    '#e3e0f3',
        'inverse-on-surface': '#2f2f3d',

        // ── Primary (Blue) ──
        primary:              '#adc6ff',
        'primary-container':  '#4d8eff',
        'primary-fixed':      '#d8e2ff',
        'primary-fixed-dim':  '#adc6ff',
        'on-primary':         '#002e6a',
        'on-primary-fixed':   '#001a42',
        'on-primary-container':'#00285d',
        'inverse-primary':    '#005ac2',

        // ── Secondary (Cyan) ──
        secondary:              '#4cd7f6',
        'secondary-container':  '#03b5d3',
        'secondary-fixed':      '#acedff',
        'secondary-fixed-dim':  '#4cd7f6',
        'on-secondary':         '#003640',
        'on-secondary-fixed':   '#001f26',
        'on-secondary-container':'#00424e',

        // ── Tertiary (Lavender) ──
        tertiary:              '#d0bcff',
        'tertiary-container':  '#a078ff',
        'tertiary-fixed':      '#e9ddff',
        'tertiary-fixed-dim':  '#d0bcff',
        'on-tertiary':         '#3c0091',
        'on-tertiary-fixed':   '#23005c',
        'on-tertiary-container':'#340080',

        // ── Error ──
        error:              '#ffb4ab',
        'error-container':  '#93000a',
        'on-error':         '#690005',
        'on-error-container':'#ffdad6',

        // ── Success (Green) ──
        success:             '#4ade80',
        'success-container': '#166534',
        'on-success':        '#052e16',

        // ── Legacy (retrocompatibilità) ──
        titan: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        dark: {
          900: '#0a0a0f',
          800: '#10101a',
          700: '#16162a',
          950: '#050510',
        },
        glow: {
          blue: '#adc6ff',
          cyan: '#4cd7f6',
        },
      },
      animation: {
        'ignition-pulse': 'ignition-pulse 2s ease-in-out infinite',
        'ignition-ring':  'ignition-ring 3s linear infinite',
        'scanline':       'scanline 8s linear infinite',
        'glow-breathe':   'glow-breathe 4s ease-in-out infinite',
        'ping-slow':      'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        'ignition-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(173,198,255,0.25), 0 0 60px rgba(76,215,246,0.1)' },
          '50%':       { boxShadow: '0 0 40px rgba(173,198,255,0.5),  0 0 80px rgba(76,215,246,0.2)' },
        },
        'ignition-ring': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'scanline': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glow-breathe': {
          '0%, 100%': { opacity: '0.3' },
          '50%':       { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
