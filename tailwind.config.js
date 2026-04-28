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
        background:                '#050510',
        'surface-container-lowest': '#0a0a0f',
        'surface-container-low':    '#10101a',
        'surface-container':        '#16162a',
        'surface-container-high':   '#1a1a2e',
        'surface-container-highest':'#1e2040',
        'surface-variant':          '#1e2040',
        'surface-dim':              '#050510',
        'surface-bright':           '#252542',

        // ── Text & Borders ──
        'on-surface':         '#e0e7ff',
        'on-surface-variant': '#bfdbfe',
        'on-background':      '#e0e7ff',
        'outline':            '#6b7280',
        'outline-variant':    '#3b82f6',
        'inverse-surface':    '#e0e7ff',
        'inverse-on-surface': '#1e2040',

        // ── Primary (Blue) ──
        primary:              '#93c5fd',
        'primary-container':  '#3b82f6',
        'primary-fixed':      '#dbeafe',
        'primary-fixed-dim':  '#93c5fd',
        'on-primary':         '#1e3a8a',
        'on-primary-fixed':   '#172554',
        'on-primary-container':'#1e40af',
        'inverse-primary':    '#2563eb',

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
        error:              '#f87171',
        'error-container':  '#7f1d1d',
        'on-error':         '#450a0a',
        'on-error-container':'#fecaca',

        // ── Success (Emerald) ──
        success:             '#34d399',
        'success-container': '#064e3b',
        'on-success':        '#022c22',

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
