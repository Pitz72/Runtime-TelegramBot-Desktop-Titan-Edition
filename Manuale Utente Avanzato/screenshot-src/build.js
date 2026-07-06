// Titan manual figure generator (plain Node, no deps).
// Emits self-contained HTML mockups of the real Titan renderer into figures/,
// reusing the app's verbatim Tailwind class strings + index.css design system so
// colors and layout match the shipping UI pixel-for-pixel. render.js rasterizes them.
'use strict';
const fs = require('fs');
const path = require('path');
const FIG = path.join(__dirname, 'figures');
fs.mkdirSync(FIG, { recursive: true });

// ── Design tokens (verbatim from tailwind.config.js) ───────────────────────────
const COLORS = {
  background: '#050510',
  'surface-container-lowest': '#0a0a0f', 'surface-container-low': '#10101a',
  'surface-container': '#16162a', 'surface-container-high': '#1a1a2e',
  'surface-container-highest': '#1e2040', 'surface-variant': '#1e2040',
  'surface-dim': '#050510', 'surface-bright': '#252542',
  'on-surface': '#e0e7ff', 'on-surface-variant': '#bfdbfe', 'on-background': '#e0e7ff',
  outline: '#6b7280', 'outline-variant': '#3b82f6',
  'inverse-surface': '#e0e7ff', 'inverse-on-surface': '#1e2040',
  primary: '#93c5fd', 'primary-container': '#3b82f6', 'primary-fixed': '#dbeafe',
  'primary-fixed-dim': '#93c5fd', 'on-primary': '#1e3a8a', 'on-primary-fixed': '#172554',
  'on-primary-container': '#1e40af', 'inverse-primary': '#2563eb',
  secondary: '#4cd7f6', 'secondary-container': '#03b5d3', 'secondary-fixed': '#acedff',
  'secondary-fixed-dim': '#4cd7f6', 'on-secondary': '#003640', 'on-secondary-fixed': '#001f26',
  'on-secondary-container': '#00424e',
  tertiary: '#d0bcff', 'tertiary-container': '#a078ff', 'tertiary-fixed': '#e9ddff',
  'tertiary-fixed-dim': '#d0bcff', 'on-tertiary': '#3c0091', 'on-tertiary-fixed': '#23005c',
  'on-tertiary-container': '#340080',
  error: '#f87171', 'error-container': '#7f1d1d', 'on-error': '#450a0a', 'on-error-container': '#fecaca',
  success: '#34d399', 'success-container': '#064e3b', 'on-success': '#022c22',
};

// ── index.css custom layer (verbatim design system, sans @tailwind directives) ─
const APP_CSS = `
body { background-color:#050510; color:#e0e7ff; font-family:'Inter',sans-serif; margin:0; font-feature-settings:'liga' 1,'calt' 1; }
::-webkit-scrollbar { width:4px; height:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:#424754; border-radius:0.75rem; }
.scanline-bg { position:relative; overflow:hidden; }
.scanline-bg::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(208,188,255,0.04) 1px,rgba(208,188,255,0.04) 2px); pointer-events:none; z-index:1; }
.scanline-bg::after { content:''; position:absolute; top:0; left:0; right:0; height:100%; background:linear-gradient(180deg,rgba(173,198,255,0.03) 0%,transparent 50%,rgba(76,215,246,0.02) 100%); pointer-events:none; z-index:1; opacity:0.6; }
.ghost-border { border:1px solid rgba(59,130,246,0.10); }
.glass-panel { background:rgba(10,10,15,0.80); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(59,130,246,0.10); box-shadow:0 20px 40px rgba(0,0,0,0.55),0 0 15px rgba(59,130,246,0.04); }
.glass-panel-elevated { background:rgba(16,16,26,0.90); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid rgba(59,130,246,0.15); box-shadow:0 24px 48px rgba(0,0,0,0.6),0 0 20px rgba(59,130,246,0.06); }
.text-glow { text-shadow:0 0 8px rgba(173,198,255,0.5); }
.text-glow-cyan { text-shadow:0 0 8px rgba(76,215,246,0.6); }
.text-glow-error { text-shadow:0 0 8px rgba(255,180,171,0.5); }
.text-micro { font-family:'Fira Code',monospace; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; }
.text-nano { font-family:'Fira Code',monospace; font-size:9px; letter-spacing:0.15em; text-transform:uppercase; }
.glow-primary { box-shadow:0 0 8px rgba(173,198,255,0.5); }
.glow-secondary { box-shadow:0 0 8px rgba(76,215,246,0.6); }
.glow-ambient { box-shadow:0 20px 40px rgba(0,0,0,0.4),0 0 15px rgba(173,198,255,0.05); }
.drop-glow-primary { filter:drop-shadow(0 0 8px rgba(173,198,255,0.5)); }
.drop-glow-secondary { filter:drop-shadow(0 0 8px rgba(76,215,246,0.6)); }
.drop-glow-success { filter:drop-shadow(0 0 8px rgba(74,222,128,0.6)); }
.text-glow-success { text-shadow:0 0 8px rgba(74,222,128,0.5); }
.glow-success { box-shadow:0 0 8px rgba(74,222,128,0.5); }
.ignition-btn { position:relative; isolation:isolate; background:conic-gradient(from 180deg at 50% 50%,#4d8eff 0deg,#03b5d3 180deg,#4d8eff 360deg); box-shadow:0 0 8px rgba(59,130,246,0.5); }
.ignition-btn.stopping { background:conic-gradient(from 180deg at 50% 50%,#93000a 0deg,#ffb4ab 180deg,#93000a 360deg); box-shadow:0 0 8px rgba(255,180,171,0.5); }
.ignition-ring { position:absolute; inset:-4px; border-radius:inherit; padding:2px; background:conic-gradient(from 0deg,rgba(173,198,255,0) 0%,rgba(173,198,255,0.6) 25%,rgba(76,215,246,0.4) 50%,rgba(173,198,255,0.6) 75%,rgba(173,198,255,0) 100%); -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; }
.panel-border { border:1px solid rgba(59,130,246,0.10); }
.status-dot-active { box-shadow:0 0 6px rgba(74,222,128,0.8),0 0 12px rgba(74,222,128,0.4); }
.status-dot-stopped { box-shadow:0 0 6px rgba(255,180,171,0.6); }
.grid-dots { background-image:radial-gradient(rgba(59,130,246,0.10) 1px,transparent 1px); background-size:24px 24px; }
.gradient-border-btn { position:relative; padding:1px; border-radius:4px; background:linear-gradient(135deg,#93c5fd,#4cd7f6); }
.gradient-border-btn > * { border-radius:3px; background:#0a0a0f; }
.nav-item-active { border-left:2px solid #3b82f6; background:rgba(59,130,246,0.06); box-shadow:inset 0 0 15px rgba(59,130,246,0.04); color:#93c5fd; }
.nav-item { border-left:2px solid transparent; }
.input-label { font-family:'Fira Code',monospace; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#8c909f; display:block; margin-bottom:4px; }
.toast-stripe-success { background:#4cd7f6; box-shadow:0 0 8px rgba(76,215,246,0.6); }
.tile-stripe-primary { background:linear-gradient(90deg,#adc6ff,transparent); }
.tile-stripe-secondary { background:linear-gradient(90deg,#4cd7f6,transparent); }
.tile-stripe-tertiary { background:linear-gradient(90deg,#d0bcff,transparent); }
/* Freeze every animation at its resting/end frame for a clean still capture */
*, *::before, *::after { animation-duration:0s !important; animation-delay:0s !important; transition:none !important; }
`;

function head(title) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fira+Code:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={theme:{extend:{fontFamily:{headline:['"Space Grotesk"','sans-serif'],body:['"Inter"','sans-serif'],titan:['"Inter"','sans-serif'],mono:['"Fira Code"','monospace'],machine:['"Fira Code"','monospace']},colors:${JSON.stringify(COLORS)}}}}</script>
<style>${APP_CSS}</style></head><body>`;
}

// ── Icons (lucide inner SVG, 24x24, stroke 1.75) ───────────────────────────────
const IC = {
  Play:'<polygon points="6 3 20 12 6 21 6 3"/>',
  Square:'<rect x="5" y="5" width="14" height="14" rx="1.5"/>',
  Settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  Download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  BarChart3:'<path d="M3 3v18h18"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-5"/>',
  Circle:'<circle cx="12" cy="12" r="10"/>',
  Plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  SlidersHorizontal:'<line x1="21" y1="6" x2="14" y2="6"/><line x1="10" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="16" y2="18"/><line x1="12" y1="18" x2="3" y2="18"/><circle cx="12" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>',
  Hash:'<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
  Check:'<polyline points="20 6 9 17 4 12"/>',
  Trash2:'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
  FileDown:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/>',
  Rss:'<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
  FileText:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',
  Globe:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  Pencil:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="M15 5l4 4"/>',
  Zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  Loader2:'<path d="M21 12a9 9 0 1 1-6.2-8.6"/>',
  Filter:'<polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/>',
  Clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  Upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  BookOpen:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  ChevronRight:'<polyline points="9 18 15 12 9 6"/>',
  ArrowRight:'<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  RefreshCw:'<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  Sparkles:'<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z"/>',
  Rocket:'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M15 9c1.08 1.62 0 5 0 5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  CheckCircle2:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  AlertTriangle:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  X:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  Database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  Eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  EyeOff:'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  TrendingUp:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  ShieldCheck:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M9 12l2 2 4-4"/>',
  LayoutTemplate:'<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="9" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  Save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  FileCode:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 13l-2 2 2 2"/><path d="M14 17l2-2-2-2"/>',
};
function icon(name, size, cls, opts) {
  opts = opts || {};
  const fill = opts.fill || 'none';
  const sw = opts.sw || 1.75;
  const color = opts.color || 'currentColor';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" class="${cls || ''}">${IC[name] || ''}</svg>`;
}

// ── Flags (verbatim from ui/Flags.tsx) ─────────────────────────────────────────
const FLAG = {
  en:'<svg viewBox="0 0 60 30" class="w-full h-full object-cover"><clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(#s)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#t)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>',
  it:'<svg viewBox="0 0 3 2" class="w-full h-full object-cover"><rect width="1" height="2" fill="#009246"/><rect width="1" height="2" x="1" fill="#FFF"/><rect width="1" height="2" x="2" fill="#CE2B37"/></svg>',
  fr:'<svg viewBox="0 0 3 2" class="w-full h-full object-cover"><rect width="1" height="2" fill="#0055A4"/><rect width="1" height="2" x="1" fill="#FFF"/><rect width="1" height="2" x="2" fill="#EF4135"/></svg>',
  de:'<svg viewBox="0 0 5 3" class="w-full h-full object-cover"><rect width="5" height="3" fill="#000"/><rect width="5" height="2" y="1" fill="#D00"/><rect width="5" height="1" y="2" fill="#FFCE00"/></svg>',
  es:'<svg viewBox="0 0 750 500" class="w-full h-full object-cover"><rect width="750" height="500" fill="#c60b1e"/><rect width="750" height="250" y="125" fill="#ffc400"/></svg>',
  pt:'<svg viewBox="0 0 600 400" class="w-full h-full object-cover"><rect width="600" height="400" fill="#f00"/><rect width="240" height="400" fill="#060"/></svg>',
  ru:'<svg viewBox="0 0 9 6" class="w-full h-full object-cover"><rect width="9" height="6" fill="#FFF"/><rect width="9" height="4" y="2" fill="#0039A6"/><rect width="9" height="2" y="4" fill="#D52B1E"/></svg>',
  zh:'<svg viewBox="0 0 30 20" class="w-full h-full object-cover"><rect width="30" height="20" fill="#DE2910"/><polygon fill="#FFDE00" points="5,2 6,4 8,4 6.5,5.5 7,7.5 5,6.5 3,7.5 3.5,5.5 2,4 4,4"/></svg>',
};
const LANGS = [
  { id:'en', label:'English' }, { id:'it', label:'Italiano' }, { id:'fr', label:'Français' }, { id:'de', label:'Deutsch' },
  { id:'es', label:'Español' }, { id:'pt', label:'Português' }, { id:'ru', label:'Русский' }, { id:'zh', label:'中文' },
];

// ── Fake data (Runtime Radio universe) ─────────────────────────────────────────
const APP = { title:'Runtime TelegramBot', edition:'Titan Edition', version:'2.1.5', copyright:'© 2026 Simone Pizzi for Runtime Radio' };
const BOTS = [
  { id:7,  name:'Runtime News Desk', channel:'@runtime_news',   date:'2026-01-15', active:true },
  { id:12, name:'Synthwave Sessions', channel:'@synthwave_fm',  date:'2025-11-02', active:true },
  { id:19, name:'Titan Tech Radar',   channel:'@titan_tech',    date:'2026-03-10', active:true },
  { id:23, name:'Night Signal',       channel:'-1001987654321', date:'2026-02-20', active:false },
];
const FEEDS = [
  { name:'Ars Technica',    type:'news',    url:'feeds.arstechnica.com/arstechnica/index',  active:true, filter:true },
  { name:'The Verge',       type:'news',    url:'theverge.com/rss/index.xml',               active:true, interval:'15 min' },
  { name:'Darknet Diaries', type:'podcast', url:'feeds.megaphone.fm/darknetdiaries',        active:true, digest:true },
  { name:'Hacker News',     type:'news',    url:'hnrss.org/frontpage',                      active:true },
  { name:'Kurzgesagt',      type:'youtube', url:'youtube.com/feeds/videos.xml?channel_id=UCsXVk37',  active:false },
];
const STATS = { today:12, week:87, total:3421 };
const LOGS = [
  ['success', '[14:36:07] ✅ [Hacker News] Posted: "Show HN: I built a self-hosted RSS-to-Telegram bridge"'],
  ['info',    '[14:36:05] [Hacker News] 2 new items found.'],
  ['info',    '[14:35:52] [The Verge] No new items.'],
  ['warn',    '[14:35:40] ⚠️ FloodWait: pausing 30s to respect Telegram rate limits.'],
  ['success', '[14:35:09] ✅ [Ars Technica] Posted: "Apple unveils the M5 chip lineup"'],
  ['success', '[14:35:08] ✅ [Ars Technica] Posted: "NASA confirms Europa Clipper flyby data"'],
  ['info',    '[14:35:06] [Ars Technica] 4 new items · filtering by keyword...'],
  ['success', '[14:34:58] ✅ [Darknet Diaries] Posted: "Ep. 148 — Secret Codes"'],
  ['info',    '[14:34:55] [Darknet Diaries] Digest window reached — releasing 1 item.'],
  ['info',    '[14:34:31] [Runtime News Desk] Monitoring 5 feeds · next scan in 15 min.'],
  ['success', '[14:34:30] 🚀 Engine online.'],
  ['success', '[14:34:29] 🚀 Starting engine...'],
];

// ── Frame writer ───────────────────────────────────────────────────────────────
function write(name, inner) {
  const html = head('Titan · ' + name) +
    `<div style="width:1280px;height:800px;overflow:hidden;position:relative" class="bg-background">${inner}</div></body></html>`;
  fs.writeFileSync(path.join(FIG, name + '.html'), html);
  console.log('  wrote', name + '.html');
}
const LOGO = 'file:///' + path.join(__dirname, 'assets', 'logo.png').replace(/\\/g, '/');

// ══════════════════════════════════════════════════════════════════════════════
//  SCREEN BUILDERS
// ══════════════════════════════════════════════════════════════════════════════

// —— Bot selector sidebar ——
function botSelector(selId) {
  const rows = BOTS.map(b => {
    const sel = b.id === selId;
    return `<div class="group p-3 cursor-pointer relative nav-item ${sel ? 'nav-item-active' : ''}">
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <div class="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-px ${b.active ? 'bg-success status-dot-active' : 'bg-outline-variant/40'}"></div>
            <h3 class="font-body font-semibold text-sm truncate ${sel ? 'text-primary' : b.active ? 'text-on-surface' : 'text-outline-variant/50'}">${b.name}</h3>
          </div>
          <div class="flex flex-col gap-0.5 mt-1 pl-3">
            <p class="text-nano font-mono flex items-center gap-1 truncate ${b.active ? 'text-outline-variant/60' : 'text-outline-variant/30'}">${icon('Hash', 9)}${b.channel}</p>
            <p class="text-nano text-primary/25">From: ${b.date}</p>
          </div>
        </div>
        ${sel ? icon('Check', 14, 'text-primary flex-shrink-0 drop-glow-primary') : ''}
      </div>
    </div>`;
  }).join('');
  return `<div class="w-72 bg-background border-r border-outline-variant/10 flex flex-col h-full">
    <div class="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-background">
      <span class="text-micro text-outline-variant/60">Active Bots</span>
      <div class="flex bg-surface-container-lowest rounded border border-outline-variant/10 p-0.5">
        <button class="p-1.5 rounded-sm text-primary">${icon('SlidersHorizontal', 13)}</button>
        <div class="w-px bg-outline-variant/15 mx-0.5 h-5 self-center"></div>
        <button class="p-1.5 rounded-sm text-outline-variant">${icon('FileDown', 13)}</button>
        <div class="gradient-border-btn ml-0.5"><div class="px-2 py-1.5 flex items-center gap-1 text-nano font-bold text-on-surface">${icon('Plus', 12)}</div></div>
      </div>
    </div>
    <div class="flex-1 overflow-hidden">${rows}</div>
  </div>`;
}

// —— Feed manager (list, optional add-form) ——
const TYPE = {
  podcast:{ icon:'Rss',      color:'text-tertiary', bg:'bg-tertiary/10', border:'border-tertiary/20' },
  youtube:{ icon:'Play',     color:'text-error',    bg:'bg-error/10',    border:'border-error/20' },
  news:   { icon:'FileText', color:'text-primary',  bg:'bg-primary/10',  border:'border-primary/20' },
};
function feedRow(f) {
  const c = TYPE[f.type];
  const badges = [
    `<span class="text-nano px-1.5 py-0.5 rounded border ${c.border} ${c.color} flex-shrink-0">${f.type.toUpperCase()}</span>`,
    f.filter ? `<span class="text-nano px-1.5 py-0.5 rounded border border-tertiary/30 text-tertiary flex-shrink-0 flex items-center gap-0.5">${icon('Filter', 8)}filter active</span>` : '',
    f.interval ? `<span class="text-nano px-1.5 py-0.5 rounded border border-secondary/30 text-secondary flex-shrink-0 flex items-center gap-0.5">${icon('Clock', 8)}${f.interval}</span>` : '',
    f.digest ? `<span class="text-nano px-1.5 py-0.5 rounded border border-tertiary-container/40 text-tertiary-container flex-shrink-0 flex items-center gap-0.5">${icon('BookOpen', 8)}digest</span>` : '',
  ].join('');
  const toggle = f.active
    ? `<div class="w-8 h-4 rounded-full relative border border-primary/40" style="background:rgba(59,130,246,0.25)"><div class="absolute top-[1px] right-[2px] h-3.5 w-3.5 rounded-full bg-primary-container"></div></div>`
    : `<div class="w-8 h-4 rounded-full relative border border-outline-variant/15 bg-surface-container-lowest"><div class="absolute top-[1px] left-[2px] h-3.5 w-3.5 rounded-full bg-outline-variant/60"></div></div>`;
  return `<div class="group ghost-border rounded-xl p-3 flex items-center gap-3 bg-background/80">
    <div class="w-9 h-9 rounded-lg flex items-center justify-center border ${c.bg} ${c.color} ${c.border} flex-shrink-0">${icon(c.icon, 16)}</div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5 flex-wrap">
        <h3 class="font-semibold text-on-surface text-sm truncate">${f.name}</h3>${badges}
      </div>
      <div class="flex items-center gap-1.5 text-nano text-outline-variant/50 mt-0.5 truncate font-mono">${icon('Globe', 9)}${f.url}</div>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0"><label class="relative inline-flex items-center ml-1">${toggle}</label></div>
  </div>`;
}
function feedManager(opts) {
  opts = opts || {};
  const form = opts.form ? feedForm() : '';
  return `<div class="flex-1 bg-surface-container-lowest flex flex-col h-full overflow-hidden">
    <div class="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
      <div>
        <h2 class="font-headline text-sm font-bold text-on-surface uppercase tracking-wide">Feed Sources</h2>
        <p class="text-nano text-outline-variant/40 mt-0.5">Manage RSS feeds</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="ghost-border bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-lg text-nano font-bold flex items-center gap-1.5">${icon('Upload', 12)}OPML</button>
        <button class="gradient-border-btn"><div class="px-3 py-1.5 flex items-center gap-1.5 text-nano font-bold text-on-surface rounded-sm">${icon('Plus', 13)}Add Source</div></button>
      </div>
    </div>
    <div class="p-4 overflow-hidden flex-1">
      ${form}
      <div class="space-y-2">${FEEDS.map(feedRow).join('')}</div>
    </div>
  </div>`;
}
function feedForm() {
  const inputCls = 'w-full bg-surface-container border border-outline-variant/15 rounded-lg p-2 text-on-surface text-sm outline-none';
  const labelCls = 'block text-micro text-outline-variant/50 mb-1.5';
  return `<div class="glass-panel rounded-xl p-4 mb-4">
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div><label class="${labelCls}">Source Name</label><input class="${inputCls}" value="MIT Technology Review"></div>
      <div><label class="${labelCls}">Source Type</label><div class="${inputCls} flex items-center justify-between">News (Article)${icon('ChevronRight', 12, 'rotate-90 text-outline-variant/50')}</div></div>
    </div>
    <div class="mb-3">
      <label class="${labelCls}">Feed URL</label>
      <div class="flex gap-2">
        <input class="${inputCls} font-mono flex-1" value="https://www.technologyreview.com/feed/">
        <button class="bg-primary/10 text-primary px-3 rounded-lg text-xs font-bold border border-primary/20 flex items-center gap-1.5 whitespace-nowrap">${icon('Zap', 12)}Test</button>
      </div>
      <div class="mt-2 text-nano px-3 py-1.5 rounded-lg border bg-secondary/10 border-secondary/20 text-secondary">✅ Valid Feed — 20 elements found</div>
    </div>
    <div class="mb-3">
      <label class="${labelCls} flex items-center gap-1.5">${icon('Clock', 10)}Check Interval</label>
      <div class="${inputCls} flex items-center justify-between">30 min${icon('ChevronRight', 12, 'rotate-90 text-outline-variant/50')}</div>
    </div>
    <div class="mb-3">
      <label class="${labelCls} flex items-center gap-1.5">${icon('Filter', 10)}Keyword Filter</label>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="text-nano text-secondary/50 mb-1 block">Include</label><input class="w-full bg-surface-container border border-secondary/20 rounded-lg p-2 text-on-surface text-xs outline-none" value="AI, robotics"></div>
        <div><label class="text-nano text-error/50 mb-1 block">Exclude</label><input class="w-full bg-surface-container border border-error/20 rounded-lg p-2 text-on-surface text-xs outline-none" value="rumor, leak"></div>
      </div>
    </div>
    <div class="mb-4">
      <label class="${labelCls} flex items-center gap-1.5">${icon('BookOpen', 10)}Digest Mode</label>
      <div class="${inputCls} flex items-center justify-between">Every 6 hours${icon('ChevronRight', 12, 'rotate-90 text-outline-variant/50')}</div>
    </div>
    <div class="flex justify-end gap-2">
      <button class="text-on-surface-variant text-xs px-3 py-1.5">Cancel</button>
      <button class="bg-primary/15 text-primary border border-primary/25 px-4 py-1.5 rounded-lg text-xs font-bold">Save Feed</button>
    </div>
  </div>`;
}

// —— Right console ——
function console_(running) {
  const logHtml = LOGS.map(([lvl, msg]) => {
    const col = lvl === 'error' ? 'text-error' : lvl === 'success' ? 'text-secondary' : lvl === 'warn' ? 'text-tertiary' : 'text-on-surface-variant';
    return `<div class="opacity-75 leading-relaxed break-words font-medium" style="margin-bottom:2px"><span class="${col}">${esc(msg)}</span></div>`;
  }).join('');
  const badge = running
    ? `<div class="px-3 py-1 rounded text-micro font-bold border flex items-center gap-2 bg-success/10 border-success/25 text-success"><div class="w-1.5 h-1.5 rounded-full bg-success status-dot-active"></div>ONLINE</div>`
    : `<div class="px-3 py-1 rounded text-micro font-bold border flex items-center gap-2 bg-error/10 border-error/20 text-error"><div class="w-1.5 h-1.5 rounded-full bg-error status-dot-stopped"></div>OFFLINE</div>`;
  const ignition = running
    ? `<div class="relative"><div class="ignition-ring"></div><button class="ignition-btn stopping relative w-20 h-20 rounded-2xl flex items-center justify-center">${icon('Square', 22, 'relative z-10', { fill:'white', color:'white' })}</button></div>`
    : `<div class="relative"><button class="ignition-btn relative w-20 h-20 rounded-2xl flex items-center justify-center">${icon('Play', 26, 'ml-1 relative z-10', { fill:'white', color:'white' })}</button></div>`;
  return `<main class="w-1/2 flex flex-col relative bg-surface-container-lowest h-full">
    <header class="px-6 py-3 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-low/90 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      <div class="flex items-center gap-3">
        <img src="${LOGO}" class="w-9 h-9 drop-shadow-[0_0_10px_rgba(59,130,246,0.30)]">
        <div>
          <h1 class="font-headline text-base font-bold tracking-tight text-on-surface uppercase leading-tight">${APP.title} <span class="text-primary font-light">${APP.edition}</span></h1>
          <div class="flex gap-2 items-baseline"><p class="text-nano text-outline-variant/40">${APP.copyright}</p><p class="text-nano text-primary/30">v${APP.version}</p></div>
        </div>
      </div>
      <div class="flex items-center gap-3">${badge}<div class="w-px h-5 bg-outline-variant/20"></div><button class="p-2 rounded text-outline-variant border border-transparent">${icon('Settings', 16)}</button></div>
    </header>
    <div class="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
      <div class="flex items-center justify-center gap-8 py-2">
        <div class="flex items-center gap-5">
          <div class="text-center"><p class="font-headline text-2xl font-bold text-primary text-glow leading-none">${STATS.today}</p><p class="text-nano text-outline-variant/50 mt-1">Today</p></div>
          <div class="w-px h-8 bg-outline-variant/20"></div>
          <div class="text-center"><p class="font-headline text-2xl font-bold text-secondary text-glow-cyan leading-none">${STATS.week}</p><p class="text-nano text-outline-variant/50 mt-1">7 Days</p></div>
        </div>
        ${ignition}
        <div class="flex items-center gap-5">
          <div class="text-center"><p class="font-headline text-2xl font-bold text-on-surface-variant leading-none">${STATS.total}</p><p class="text-nano text-outline-variant/50 mt-1">Total</p></div>
          <div class="w-px h-8 bg-outline-variant/20"></div>
          <div class="flex flex-col items-center gap-1 text-outline-variant/40">${icon('BarChart3', 16)}<span class="text-nano">Stats</span></div>
        </div>
      </div>
      <div class="flex-1 bg-surface-container-lowest rounded-xl ghost-border font-mono text-xs overflow-hidden flex flex-col shadow-inner relative scanline-bg">
        <div class="flex justify-between items-center px-4 py-2.5 border-b border-outline-variant/10 bg-surface-container-low/60 relative z-10">
          <div class="flex items-center gap-3">
            <span class="text-micro text-outline-variant/50">System Logs // All Channels</span>
            <div class="flex items-center bg-surface-container-lowest/80 rounded border border-outline-variant/10 overflow-hidden">
              <button class="px-2 py-0.5 text-nano font-bold bg-primary/15 text-primary">All Bots</button>
              <button class="px-2 py-0.5 text-nano font-bold text-outline-variant/40">This Bot</button>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button class="text-outline-variant/40 text-nano flex items-center gap-1">${icon('Download', 11)}Export</button>
            <span class="text-outline-variant/20">|</span>
            <button class="text-outline-variant/40 text-nano">Clear</button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden relative z-10 px-4 pt-2 pb-2">${logHtml}</div>
      </div>
    </div>
  </main>`;
}

function dashboard(opts) {
  opts = opts || {};
  const running = opts.running !== false;
  return `<div class="h-full w-full bg-background text-on-surface flex font-body overflow-hidden relative">
    <div class="w-1/2 flex h-full">${botSelector(7)}<div class="flex-1 border-r border-outline-variant/15 flex flex-col bg-surface-container-lowest h-full overflow-hidden">${feedManager({ form: opts.feedForm })}</div></div>
    ${console_(running)}
  </div>`;
}

// —— Modal overlay wrapper ——
// Blur + dim the live dashboard directly (plain CSS filter — reliable in headless,
// unlike backdrop-filter which needs GPU compositing), then a dark scrim, then the
// crisp modal. Reproduces the app's "glass modal floating over the app" look.
function overlay(modalInner) {
  return `<div class="absolute inset-0" style="filter:blur(14px) brightness(0.5)">${dashboard({ running:true })}</div>
    <div class="absolute inset-0 bg-background/70"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">${modalInner}</div>`;
}

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ══════════════════════════════════════════════════════════════════════════════
//  FIGURES
// ══════════════════════════════════════════════════════════════════════════════

// 01 — Intro / welcome
function figIntro() {
  const grid = LANGS.map(l => {
    const on = l.id === 'en';
    return `<button class="relative flex flex-col items-center p-3 rounded-xl border ${on ? 'bg-primary/15 border-primary/40 text-on-surface' : 'bg-surface-container-lowest border-outline-variant/10 text-outline-variant/60'}">
      <div class="w-8 h-6 mb-2 rounded overflow-hidden shadow-sm shadow-black/50">${FLAG[l.id]}</div>
      <span class="text-nano">${l.label}</span>
      ${on ? '<div class="absolute inset-0 border-2 border-primary/50 rounded-xl pointer-events-none"></div>' : ''}
    </button>`;
  }).join('');
  write('01-intro-welcome', `<div class="h-full w-full bg-background flex flex-col items-center justify-center relative overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none grid-dots">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] opacity-60"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] opacity-40"></div>
    </div>
    <div class="relative z-10 max-w-2xl w-full p-8 flex flex-col items-center">
      <img src="${LOGO}" class="w-28 h-28 mb-6" style="filter:drop-shadow(0 0 24px rgba(173,198,255,0.25))">
      <h1 class="font-headline text-4xl font-black tracking-tight mb-2 text-on-surface">${APP.title} <span class="text-primary drop-glow-primary">Titan Edition</span></h1>
      <p class="text-outline-variant/60 text-sm font-body mb-3">${APP.copyright}</p>
      <div class="h-6 mb-9 flex items-center justify-center"><span class="text-nano text-outline-variant/35 font-mono">v${APP.version}</span></div>
      <div class="w-full glass-panel rounded-2xl p-6 mb-8">
        <h3 class="text-center text-micro text-secondary mb-6 drop-glow-secondary">Interface Language</h3>
        <div class="grid grid-cols-4 gap-4">${grid}</div>
      </div>
      <button class="ignition-btn flex items-center gap-2 text-on-primary-fixed px-10 py-3.5 rounded-full font-headline font-bold text-sm shadow-lg">Launch Titan ${icon('ChevronRight', 18)}</button>
      <p class="text-nano text-outline-variant/25 mt-8">INIT_SEQ · TITAN_DESKTOP_RUNTIME</p>
    </div>
  </div>`);
}

// 02 — Setup wizard (step 1)
function figSetup() {
  const inputCls = 'w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg p-3.5 text-on-surface outline-none text-sm font-body';
  write('02-setup-wizard', `<div class="h-full w-full flex items-center justify-center bg-background text-on-surface p-8 font-body overflow-hidden relative">
    <div class="absolute inset-0 grid-dots pointer-events-none opacity-40"></div>
    <div class="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-primary/6 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-secondary/4 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
    <div class="max-w-md w-full space-y-8 relative z-10">
      <div class="text-center space-y-2">
        <img src="${LOGO}" class="w-16 h-16 mx-auto mb-4" style="filter:drop-shadow(0 0 16px rgba(173,198,255,0.2))">
        <h1 class="font-headline text-3xl font-black text-on-surface tracking-tighter uppercase">${APP.title} <span class="text-primary drop-glow-primary">${APP.edition}</span></h1>
        <p class="text-outline-variant/50 text-sm">Initialize your bot environment</p>
        <p class="text-nano text-outline-variant/25">${APP.copyright}</p>
      </div>
      <div class="glass-panel rounded-2xl overflow-hidden relative">
        <div class="h-0.5 bg-surface-container-lowest w-full"><div class="h-full" style="width:25%;background:linear-gradient(90deg,#4d8eff,#03b5d3);box-shadow:0 0 8px rgba(77,142,255,0.5)"></div></div>
        <div class="p-8">
          <div class="flex items-center justify-between mb-6"><span class="text-nano text-outline-variant/40">SETUP_WIZARD</span><span class="text-nano text-primary/60">1/4</span></div>
          <div class="space-y-4">
            <label class="block text-micro text-primary/60">1. Bot Name</label>
            <input class="${inputCls}" value="Runtime News Desk">
            <p class="text-nano text-outline-variant/40">A descriptive name to identify this bot</p>
          </div>
          <button class="mt-8 w-full ignition-btn text-on-primary-fixed font-headline font-bold py-4 rounded-xl flex items-center justify-center gap-2">Next Step ${icon('ArrowRight', 18)}</button>
        </div>
      </div>
    </div>
  </div>`);
}

// 03 — Dashboard online (hero)
function figDashboard() { write('03-dashboard-online', dashboard({ running:true })); }

// 06 — Feed form open
function figFeedForm() { write('06-feed-form', dashboard({ running:true, feedForm:true })); }

// —— Bot settings modal ——
function botSettingsGeneral() {
  const inputCls = 'w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg p-3 text-on-surface outline-none text-sm';
  const labelCls = 'text-micro text-outline-variant mb-1.5 flex items-center gap-1.5 block';
  return `<div class="glass-panel w-full max-w-6xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
    <div class="flex justify-between items-center px-6 pt-6 pb-4 border-b border-outline-variant/10 bg-surface-container-lowest">
      <div><h2 class="font-headline text-xl font-bold text-on-surface">Edit Bot</h2><p class="text-nano text-outline-variant/50 mt-0.5">BOT_ID: 0x0007 · <span class="text-primary/60">Runtime News Desk</span></p></div>
      <button class="p-1 text-outline-variant rounded">${icon('X', 18)}</button>
    </div>
    <div class="flex border-b border-outline-variant/10 px-6 bg-surface-container-lowest">
      <button class="flex items-center gap-2 px-4 py-3 text-micro border-b-2 border-primary text-primary">${icon('Settings', 14)}General</button>
      <button class="flex items-center gap-2 px-4 py-3 text-micro border-b-2 border-transparent text-outline-variant/50">${icon('LayoutTemplate', 14)}Templates</button>
    </div>
    <div class="p-6 overflow-hidden flex-1">
      <div class="grid grid-cols-2 gap-8 items-start">
        <div class="space-y-5">
          <div><label class="${labelCls}">Bot Label / Name</label><input class="${inputCls}" value="Runtime News Desk"></div>
          <div><label class="${labelCls}">Telegram Bot Token</label><div class="relative"><input class="${inputCls} pr-10 font-mono text-xs" type="password" value="0000000000000000000000"><button class="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant">${icon('Eye', 14)}</button></div></div>
          <div><label class="${labelCls}">Destination Channel ID</label><input class="${inputCls} font-mono text-xs" value="@runtime_news"></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="${labelCls}">Cutoff Date</label><input class="${inputCls}" value="2026-01-15"></div>
            <div><label class="${labelCls}">Bot Active</label><div class="w-full h-[46px] rounded-lg border flex items-center px-4 text-sm font-medium bg-success/10 border-success/30 text-success"><div class="w-1.5 h-1.5 rounded-full mr-2 bg-success status-dot-active"></div>Active</div></div>
          </div>
          <div><label class="${labelCls}">Desktop Notifications</label><div class="w-full h-[46px] rounded-lg border flex items-center px-4 text-sm font-medium bg-success/10 border-success/30 text-success"><div class="w-1.5 h-1.5 rounded-full mr-2 bg-success status-dot-active"></div>Enabled</div><p class="text-nano text-outline-variant/50 mt-1">Show an OS alert when a post is sent</p></div>
        </div>
        <div class="space-y-8 flex flex-col h-full">
          <div>
            <label class="${labelCls}">${icon('Clock', 11)}Check Interval</label>
            <div class="flex items-center gap-3">
              <input type="range" min="1" max="120" value="15" class="flex-1 h-1 rounded-full accent-primary" style="accent-color:#93c5fd">
              <div class="ghost-border bg-surface-container-lowest rounded-lg px-3 py-2 text-primary font-mono text-sm min-w-[80px] text-center">15 min</div>
            </div>
            <p class="text-nano text-outline-variant/50 mt-1">Minutes between feeds checks</p>
          </div>
          <div>
            <label class="${labelCls}">${icon('Clock', 11)}Active Hours</label>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-nano text-outline-variant/40 mb-1 block">From</label><input class="${inputCls}" value="07:00"></div>
              <div><label class="text-nano text-outline-variant/40 mb-1 block">To</label><input class="${inputCls}" value="23:30"></div>
            </div>
            <p class="text-nano text-outline-variant/50 mt-1.5 leading-tight">The bot will only send messages during this time</p>
          </div>
          <div class="flex-1 flex flex-col justify-end">
            <div class="pt-5 border-t border-error/10 space-y-4">
              <div class="flex items-center gap-2 text-micro text-error/80">${icon('AlertTriangle', 14)}Danger Zone</div>
              <div class="bg-error/5 border border-error/15 rounded-xl p-4 flex items-center justify-between gap-4">
                <div><h4 class="text-sm font-semibold text-error">Clear Broadcast History</h4><p class="text-nano text-error/60 mt-1 leading-relaxed">The bot will forget what it sent.<br>USE WITH CAUTION!</p></div>
                <button class="flex items-center gap-2 bg-error/10 text-error px-4 py-2 rounded-lg text-xs font-bold border border-error/20 flex-shrink-0">${icon('Database', 13)}Clear History</button>
              </div>
            </div>
            <div class="pt-5 border-t border-outline-variant/10 space-y-4 mt-4">
              <div class="flex items-center gap-2 text-micro text-outline-variant/50">${icon('Download', 14)}Sharing</div>
              <div class="ghost-border bg-primary/5 rounded-xl p-4 flex items-center justify-between gap-4">
                <div><h4 class="text-sm font-semibold text-primary/80">Export to .rtb</h4><p class="text-nano text-primary/40 mt-1 leading-relaxed">Create a self-installing file containing the parameters and feeds of this bot, to share on another computer.</p></div>
                <button class="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-xs font-bold border border-primary/20 flex-shrink-0">${icon('Download', 13)}Export</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="p-6 border-t border-outline-variant/10 bg-surface-container-lowest flex justify-between items-center">
      <button class="flex items-center gap-2 text-error/70 text-sm px-4 py-2 rounded-lg border border-transparent">${icon('Trash2', 14)}Delete Bot</button>
      <div class="flex gap-3">
        <button class="px-5 py-2 rounded-lg text-sm text-on-surface-variant">Cancel</button>
        <button class="flex items-center gap-2 ignition-btn px-6 py-2 rounded-lg text-sm font-headline font-bold text-on-primary-fixed">${icon('Save', 14)}Save Bot</button>
      </div>
    </div>
  </div>`;
}
function figBotGeneral() { write('04-bot-settings-general', overlay(botSettingsGeneral())); }

// —— Bot settings: templates tab ——
function templateEditor(label, value, opts) {
  opts = opts || {};
  const chips = opts.hideChips ? '' : `<div class="flex items-center gap-2"><span class="text-nano text-outline-variant/50">Insert variable:</span>
    <button class="px-2 py-1 bg-primary/10 text-primary rounded text-nano font-mono border border-primary/20">[Titolo]</button>
    <button class="px-2 py-1 bg-primary/10 text-primary rounded text-nano font-mono border border-primary/20">[Sorgente]</button>
    <button class="px-2 py-1 bg-primary/10 text-primary rounded text-nano font-mono border border-primary/20">[Link]</button>
    <button class="px-2 py-1 bg-primary/10 text-primary rounded text-nano font-mono border border-primary/20">[Sommario]</button></div>`;
  const previewBtn = opts.hideChips ? '' : `<button class="flex items-center gap-1 px-2 py-0.5 rounded text-nano font-bold border ${opts.preview ? 'bg-secondary/15 border-secondary/30 text-secondary' : 'bg-surface-container-lowest border-outline-variant/20 text-outline-variant'}">${icon(opts.preview ? 'EyeOff' : 'Eye', 10)}Preview</button>`;
  const preview = opts.preview ? `<div class="bg-surface-container-lowest ghost-border rounded-lg p-3 text-xs text-on-surface leading-relaxed font-body scanline-bg relative" style="white-space:pre-wrap">${opts.previewHtml}</div>` : '';
  return `<div class="flex flex-col gap-2 p-4 ghost-border bg-surface-container rounded-xl">
    <div class="flex justify-between items-center mb-1">
      <div class="flex items-center gap-3"><label class="text-sm font-headline font-semibold text-primary">${label}</label>${previewBtn}</div>${chips}
    </div>
    ${preview}
    <textarea class="w-full h-32 bg-surface-container-lowest border rounded-lg p-3 text-on-surface outline-none font-mono text-xs resize-y border-outline-variant/15">${esc(value)}</textarea>
    <div class="space-y-1"><div class="flex items-center gap-1.5 text-nano text-secondary/70"><span>✓</span><span>Template valid — no issues detected</span></div></div>
    <p class="text-nano text-outline-variant/40 mt-1">Supports basic Telegram HTML (&lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;a&gt;link&lt;/a&gt;). Titan version will always be appended automatically to the startup message.</p>
  </div>`;
}
function botSettingsTemplates() {
  const newsTpl = "📰 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n🔗 <a href='{{link}}'>Read the full article</a>";
  const previewHtml = '📰 <b>Feed Name</b><br><br><b>Sample article title</b><br><br>🔗 <a>Read the full article</a>';
  return `<div class="glass-panel w-full max-w-6xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
    <div class="flex justify-between items-center px-6 pt-6 pb-4 border-b border-outline-variant/10 bg-surface-container-lowest">
      <div><h2 class="font-headline text-xl font-bold text-on-surface">Edit Bot</h2><p class="text-nano text-outline-variant/50 mt-0.5">BOT_ID: 0x0007 · <span class="text-primary/60">Runtime News Desk</span></p></div>
      <button class="p-1 text-outline-variant rounded">${icon('X', 18)}</button>
    </div>
    <div class="flex border-b border-outline-variant/10 px-6 bg-surface-container-lowest">
      <button class="flex items-center gap-2 px-4 py-3 text-micro border-b-2 border-transparent text-outline-variant/50">${icon('Settings', 14)}General</button>
      <button class="flex items-center gap-2 px-4 py-3 text-micro border-b-2 border-primary text-primary">${icon('LayoutTemplate', 14)}Templates</button>
    </div>
    <div class="p-6 overflow-hidden flex-1">
      <div class="space-y-6">
        ${templateEditor('Startup Message Template', '🟢 <b>Bot Started</b>', { hideChips:true })}
        ${templateEditor('News Template', newsTpl, { preview:true, previewHtml })}
      </div>
    </div>
    <div class="p-6 border-t border-outline-variant/10 bg-surface-container-lowest flex justify-between items-center">
      <button class="flex items-center gap-2 text-error/70 text-sm px-4 py-2 rounded-lg">${icon('Trash2', 14)}Delete Bot</button>
      <div class="flex gap-3"><button class="px-5 py-2 rounded-lg text-sm text-on-surface-variant">Cancel</button><button class="flex items-center gap-2 ignition-btn px-6 py-2 rounded-lg text-sm font-headline font-bold text-on-primary-fixed">${icon('Save', 14)}Save Bot</button></div>
    </div>
  </div>`;
}
function figBotTemplates() { write('05-bot-settings-templates', overlay(botSettingsTemplates())); }

// —— Stats modal ——
function statsModal() {
  const byFeed = [
    { name:'Ars Technica', today:5, total:1287 },
    { name:'Hacker News', today:4, total:942 },
    { name:'Darknet Diaries', today:1, total:112 },
    { name:'The Verge', today:2, total:806 },
    { name:'Kurzgesagt', today:0, total:274 },
  ];
  const max = Math.max.apply(null, byFeed.map(f => f.total));
  const rows = byFeed.map(f => `<div class="ghost-border bg-surface-container-lowest/60 rounded-lg p-3">
    <div class="flex justify-between items-center mb-2">
      <span class="text-xs font-medium text-on-surface truncate flex-1 mr-2">${f.name}</span>
      <div class="flex items-center gap-3 flex-shrink-0"><span class="text-nano text-secondary font-bold">+${f.today} <span class="text-outline-variant/40 font-normal">Today</span></span><span class="text-nano text-on-surface-variant font-bold">${f.total} Total</span></div>
    </div>
    <div class="h-0.5 bg-surface-container-highest rounded-full overflow-hidden"><div class="h-full rounded-full" style="width:${Math.max(2, (f.total/max)*100)}%;background:linear-gradient(90deg,#4cd7f6,#adc6ff)"></div></div>
  </div>`).join('');
  const tile = (label, tag, val, cls, stripe) => `<div class="ghost-border bg-surface-container rounded-lg p-4 flex flex-col justify-between relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full h-0.5 ${stripe} opacity-60"></div>
    <div class="flex justify-between items-start mb-3"><span class="text-nano text-on-surface-variant">${label}</span><span class="text-nano text-tertiary/50">${tag}</span></div>
    <div class="flex items-baseline gap-1.5"><span class="font-headline text-3xl font-bold ${cls}">${val}</span></div></div>`;
  return `<div class="glass-panel w-full max-w-lg rounded-xl overflow-hidden flex flex-col max-h-[80vh]">
    <div class="flex justify-between items-center px-6 pt-5 pb-4 border-b border-outline-variant/15 bg-surface-container-high/50">
      <div class="flex items-center gap-3">${icon('BarChart3', 18, 'text-primary drop-glow-primary')}<div><h2 class="font-headline text-base font-bold text-on-surface">Detailed Statistics</h2><p class="text-nano text-outline-variant/50">Runtime News Desk</p></div></div>
      <button class="p-1 text-outline-variant rounded">${icon('X', 16)}</button>
    </div>
    <div class="p-6 overflow-hidden flex-1 scanline-bg">
      <div class="grid grid-cols-3 gap-4 mb-6">
        ${tile('Today', 'VOL:24H', STATS.today, 'text-primary text-glow', 'tile-stripe-primary')}
        ${tile('7 Days', 'VOL:168H', STATS.week, 'text-secondary text-glow-cyan', 'tile-stripe-secondary')}
        ${tile('Total', 'ALL', STATS.total, 'text-on-surface', 'tile-stripe-tertiary')}
      </div>
      <div>
        <div class="flex items-center gap-2 text-micro text-outline-variant/50 mb-3">${icon('TrendingUp', 11)}Published by Feed</div>
        <div class="space-y-3">${rows}</div>
      </div>
    </div>
  </div>`;
}
function figStats() { write('07-stats-modal', overlay(statsModal())); }

// —— System settings ——
function sysShell(tab, body) {
  const tabBtn = (key, label) => `<button class="px-5 py-3 text-micro border-b-2 ${tab===key?'border-primary text-primary':'border-transparent text-outline-variant/50'}">${label}</button>`;
  return `<div class="glass-panel w-full max-w-4xl rounded-xl overflow-hidden flex flex-col">
    <div class="flex justify-between items-center p-6 border-b border-outline-variant/15 bg-surface-container-high/50">
      <div><h2 class="font-headline text-xl font-bold text-on-surface flex items-center gap-3">${icon('ShieldCheck', 20, 'text-primary drop-glow-primary')}System Settings</h2><p class="text-nano text-outline-variant/50 mt-1">Data and Database Management</p></div>
      <button class="p-1 text-outline-variant rounded">${icon('X', 18)}</button>
    </div>
    <div class="flex bg-surface-container-lowest border-b border-outline-variant/15 px-6 pt-2">${tabBtn('general','General')}${tabBtn('backup','Data & Backup')}${tabBtn('performance','Performance')}</div>
    <div class="p-6">${body}</div>
    <div class="p-4 border-t border-outline-variant/15 bg-surface-container-low/40 flex justify-end"><button class="px-6 py-2 rounded-lg text-sm font-headline font-bold ignition-btn text-on-primary-fixed shadow-lg">Close</button></div>
  </div>`;
}
function sysGeneral() {
  const flags = LANGS.map(l => `<button class="p-2 rounded-lg ${l.id==='en'?'bg-primary/15 ring-1 ring-primary/40':'opacity-50'}"><div class="w-6 h-4 overflow-hidden rounded shadow-sm">${FLAG[l.id]}</div></button>`).join('');
  return `<div class="max-w-md space-y-8">
    <div class="space-y-4">
      <div class="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">${icon('Globe', 13)}Interface Language</div>
      <p class="text-xs text-on-surface-variant leading-relaxed">Change the application language</p>
      <div class="flex flex-wrap items-center gap-2 bg-surface-container-lowest rounded-xl p-3 ghost-border w-max">${flags}</div>
    </div>
    <div class="space-y-4">
      <div class="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">${icon('RefreshCw', 13)}Updates</div>
      <p class="text-xs text-on-surface-variant leading-relaxed">Manually check whether a new version of Titan Edition is available.</p>
      <div class="flex items-center gap-4">
        <button class="flex items-center gap-2 px-4 py-2 rounded-lg ghost-border bg-primary/5 text-primary text-sm font-bold">${icon('RefreshCw', 15)}Check for updates</button>
        <div class="text-nano"><span class="flex items-center gap-1.5 text-success">${icon('CheckCircle2', 12)}You're on the latest version</span></div>
      </div>
    </div>
  </div>`;
}
function sysBackup() {
  const card = (icn, size, title, hint, cls, hintCls) => `<button class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl ghost-border ${cls}"><div>${icon(icn, size, 'opacity-80')}</div><span class="text-sm font-bold">${title}</span><span class="text-nano ${hintCls} text-center">${hint}</span></button>`;
  return `<div class="grid grid-cols-2 gap-8 items-start">
    <div class="space-y-4">
      <div class="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">${icon('Database', 13)}Database Management</div>
      <p class="text-xs text-on-surface-variant leading-relaxed">Export or import the whole bot archive.</p>
      <div class="grid grid-cols-2 gap-3">
        ${card('Download', 24, 'Export DB', 'Save titan.db', 'bg-primary/5 text-primary', 'text-primary/40')}
        ${card('Upload', 24, 'Import DB', 'Requires restart', 'bg-tertiary/5 text-tertiary', 'text-tertiary/40')}
      </div>
    </div>
    <div class="space-y-4">
      <div class="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">${icon('FileCode', 13)}Bot Profiles (.rtb)</div>
      <p class="text-xs text-on-surface-variant leading-relaxed">Export or import bot configurations without history.</p>
      <div class="grid grid-cols-2 gap-3">
        ${card('Download', 20, 'Export All', 'Save a single .rtb file', 'bg-primary/5 text-primary', 'text-primary/40')}
        ${card('Upload', 20, 'Import', 'Adds existing bots', 'bg-secondary/5 text-secondary', 'text-secondary/40')}
      </div>
    </div>
  </div>`;
}
function sysPerformance() {
  const items = [
    'Phosphorescent scanline overlay', 'Glass effect (backdrop-blur)',
    'Glow, box-shadow and text-shadow effects', 'Ignition-pulse and ignition-ring animations',
  ].map(t => `<div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-outline-variant/30 flex-shrink-0"></span>${t}</div>`).join('');
  return `<div class="max-w-lg space-y-6">
    <div class="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">${icon('Zap', 13)}Performance Mode</div>
    <p class="text-xs text-on-surface-variant leading-relaxed">Disable GPU-heavy visual effects (scanlines, blur, glow, animations) to improve smoothness on 4K displays or legacy GPU hardware.</p>
    <label class="flex items-center justify-between p-4 rounded-xl ghost-border bg-surface-container-lowest">
      <div class="space-y-1"><p class="text-sm font-bold text-on-surface font-headline">Enable Performance Mode</p><p class="text-nano text-outline-variant/50">Takes effect immediately — no restart required</p></div>
      <div class="relative w-11 h-6 rounded-full flex-shrink-0 bg-surface-container-highest"><span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-outline-variant"></span></div>
    </label>
    <div class="space-y-2 text-xs text-outline-variant/60"><p class="text-micro text-outline-variant/40 pb-1">Disabled effects:</p>${items}</div>
  </div>`;
}
function figSysGeneral() { write('08-system-general', overlay(sysShell('general', sysGeneral()))); }
function figSysBackup() { write('09-system-backup', overlay(sysShell('backup', sysBackup()))); }
function figSysPerf() { write('10-system-performance', overlay(sysShell('performance', sysPerformance()))); }

// —— Update modal (available) ——
function updateModal() {
  return `<div class="relative w-full max-w-lg glass-panel rounded-2xl overflow-hidden" style="box-shadow:0 24px 60px rgba(0,0,0,0.5),0 0 24px rgba(173,198,255,0.12)">
    <div class="absolute inset-0 pointer-events-none overflow-hidden"><div class="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/10 blur-[80px]"></div></div>
    <div class="relative z-10 p-8 flex flex-col items-center text-center">
      <div class="p-4 rounded-2xl bg-primary/10 text-primary mb-5 drop-glow-primary">${icon('Rocket', 34)}</div>
      <h2 class="font-headline text-2xl font-black tracking-tight text-on-surface mb-2">New Version Available</h2>
      <p class="text-sm text-on-surface-variant leading-relaxed mb-6 max-w-sm">A new version of Titan Edition is available. Do you want to download it now?</p>
      <div class="flex items-center justify-center gap-4 w-full">
        <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-surface-container-lowest ghost-border min-w-[120px]"><span class="text-nano text-outline-variant/40 mb-1">Current version</span><span class="font-headline text-base font-bold text-on-surface-variant">v2.1.5</span></div>
        <span class="text-outline-variant/30 text-lg">→</span>
        <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 min-w-[120px]"><span class="text-nano text-primary/50 mb-1">New version</span><span class="font-headline text-base font-black text-primary drop-glow-primary">v2.2.0</span></div>
      </div>
      <div class="flex items-center gap-3 mt-7 w-full justify-center">
        <button class="px-5 py-2.5 rounded-lg text-sm font-body text-on-surface-variant">Later</button>
        <button class="flex items-center gap-2 px-7 py-2.5 rounded-lg text-sm font-headline font-bold ignition-btn text-on-primary-fixed shadow-lg">${icon('Download', 16)}Download now</button>
      </div>
    </div>
  </div>`;
}
function figUpdate() { write('11-update-available', overlay(updateModal())); }

// ── Build all ──────────────────────────────────────────────────────────────────
figIntro();
figSetup();
figDashboard();
figBotGeneral();
figBotTemplates();
figFeedForm();
figStats();
figSysGeneral();
figSysBackup();
figSysPerf();
figUpdate();
console.log('Done. Figures in', FIG);
