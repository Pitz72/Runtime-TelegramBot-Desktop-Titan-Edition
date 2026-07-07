// Shared primitives and icons for Titan UI frames
// Palette & tokens
const T = {
  titan50:'#eff6ff', titan100:'#dbeafe', titan200:'#bfdbfe', titan300:'#93c5fd',
  titan400:'#60a5fa', titan500:'#3b82f6', titan600:'#2563eb', titan700:'#1d4ed8',
  titan800:'#1e40af', titan900:'#1e3a8a', titan950:'#172554',
  dark950:'#050510', dark900:'#0a0a0f', dark800:'#10101a', dark700:'#16162a',
  cyan:'#06b6d4', red:'#ef4444', amber:'#f59e0b', green:'#10b981',
  violet:'#8b5cf6', purple:'#a855f7',
  emerald:'#22c55e',
};

// Inline-SVG icon set (lucide-style, stroke=1.75)
// Using ONLY the whitelist.
const IconBase = ({ size=16, stroke=T.titan400, strokeWidth=1.75, children, fill='none', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
       strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);
const I = {
  Play: (p)=> <IconBase {...p}><polygon points="6 3 20 12 6 21 6 3" fill={p.fill||p.stroke}/></IconBase>,
  Square:(p)=> <IconBase {...p}><rect x="5" y="5" width="14" height="14" rx="1.5" fill={p.fill||p.stroke}/></IconBase>,
  Settings:(p)=> <IconBase {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></IconBase>,
  Download:(p)=> <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></IconBase>,
  BarChart3:(p)=> <IconBase {...p}><path d="M3 3v18h18"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-5"/></IconBase>,
  Shield:(p)=> <IconBase {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconBase>,
  Plus:(p)=> <IconBase {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></IconBase>,
  SlidersHorizontal:(p)=> <IconBase {...p}><line x1="21" y1="6" x2="14" y2="6"/><line x1="10" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="16" y2="18"/><line x1="12" y1="18" x2="3" y2="18"/><circle cx="12" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="18" r="2"/></IconBase>,
  Hash:(p)=> <IconBase {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></IconBase>,
  Check:(p)=> <IconBase {...p}><polyline points="20 6 9 17 4 12"/></IconBase>,
  Trash2:(p)=> <IconBase {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></IconBase>,
  FileDown:(p)=> <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></IconBase>,
  Rss:(p)=> <IconBase {...p}><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></IconBase>,
  FileText:(p)=> <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></IconBase>,
  Globe:(p)=> <IconBase {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></IconBase>,
  Edit2:(p)=> <IconBase {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></IconBase>,
  Zap:(p)=> <IconBase {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={p.fill||'none'}/></IconBase>,
  Loader2:(p)=> <IconBase {...p}><path d="M21 12a9 9 0 1 1-6.2-8.6"/></IconBase>,
  Filter:(p)=> <IconBase {...p}><polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/></IconBase>,
  Clock:(p)=> <IconBase {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconBase>,
  Upload:(p)=> <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></IconBase>,
  BookOpen:(p)=> <IconBase {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></IconBase>,
  Save:(p)=> <IconBase {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></IconBase>,
  AlertTriangle:(p)=> <IconBase {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></IconBase>,
  X:(p)=> <IconBase {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></IconBase>,
  Database:(p)=> <IconBase {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></IconBase>,
  LayoutTemplate:(p)=> <IconBase {...p}><rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="9" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></IconBase>,
  Eye:(p)=> <IconBase {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></IconBase>,
  EyeOff:(p)=> <IconBase {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></IconBase>,
  TrendingUp:(p)=> <IconBase {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></IconBase>,
  FileJson:(p)=> <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 13v2a1 1 0 0 1-1 1"/><path d="M14 13v2a1 1 0 0 0 1 1"/></IconBase>,
  AlertCircle:(p)=> <IconBase {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></IconBase>,
  Info:(p)=> <IconBase {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></IconBase>,
  CheckCircle:(p)=> <IconBase {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconBase>,
  ChevronRight:(p)=> <IconBase {...p}><polyline points="9 18 15 12 9 6"/></IconBase>,
  ArrowRight:(p)=> <IconBase {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></IconBase>,
  RefreshCw:(p)=> <IconBase {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></IconBase>,
};

// Flag SVG emoji-style tiles (flat colored rects — abstracted, not real flags to avoid copyright)
const FlagTile = ({code}) => {
  // Simple 3-band abstract flag
  const palettes = {
    EN:['#012169','#ffffff','#C8102E'],
    IT:['#008C45','#F4F5F0','#CD212A'],
    FR:['#002395','#ffffff','#ED2939'],
    DE:['#000000','#DD0000','#FFCE00'],
    ES:['#AA151B','#F1BF00','#AA151B'],
    PT:['#046A38','#046A38','#DA291C'],
    RU:['#ffffff','#0039A6','#D52B1E'],
    ZH:['#DE2910','#DE2910','#FFDE00'],
  };
  const [a,b,c] = palettes[code] || ['#333','#666','#999'];
  return (
    <svg width="32" height="22" viewBox="0 0 32 22" style={{borderRadius:2,display:'block'}}>
      <rect width="32" height="22" fill={b}/>
      <rect width="10.67" height="22" fill={a}/>
      <rect x="21.33" width="10.67" height="22" fill={c}/>
      {code==='ZH' && <circle cx="8" cy="6" r="2.5" fill="#FFDE00"/>}
      {code==='EN' && <>
        <rect x="14" y="0" width="4" height="22" fill={c}/>
        <rect x="0" y="9" width="32" height="4" fill={c}/>
      </>}
    </svg>
  );
};

// Generic panel border
const panelBorder = {
  border:'1px solid rgba(59,130,246,0.08)',
  boxShadow:'inset 0 0 30px rgba(59,130,246,0.02)',
};
const panelBorderActive = {
  border:'1px solid rgba(59,130,246,0.15)',
  boxShadow:'inset 0 0 30px rgba(59,130,246,0.03), 0 0 20px rgba(59,130,246,0.05)',
};

// Scanline bg (static css pattern, no animation in static frames)
const scanlineStyle = {
  backgroundImage:`repeating-linear-gradient(to bottom, rgba(59,130,246,0.04) 0 1px, transparent 1px 3px)`,
};
const gridDotsStyle = {
  backgroundImage:`radial-gradient(rgba(59,130,246,0.06) 1px, transparent 1px)`,
  backgroundSize:'20px 20px',
};

Object.assign(window, { T, I, FlagTile, panelBorder, panelBorderActive, scanlineStyle, gridDotsStyle });
