// Dashboard frames
// Renders at 1280x800 fixed size.

const SAMPLE_BOTS = [
  { id:1, name:'Runtime Radio Bot',    channel:'@runtimeradio',      date:'2026-01-12', active:true },
  { id:2, name:'Tech News Italia',     channel:'@technewsit',        date:'2026-02-03', active:true },
  { id:3, name:'Indie Podcast Cast',   channel:'-1001987654321',     date:'2025-11-28', active:true },
  { id:4, name:'Cyber Feed Watch',     channel:'@cyberfeedwatch',    date:'2026-03-02', active:false },
  { id:5, name:'Sci-Fi Weekly',        channel:'@scifiweekly',       date:'2026-02-18', active:true },
];

const SAMPLE_FEEDS = [
  { id:1, type:'podcast', name:'Runtime Radio — The Show', url:'https://feeds.runtimeradio.it/podcast.xml',
    filter:true, interval:'15 min', digest:false, enabled:true },
  { id:2, type:'news',    name:'Il Post — Tecnologia',     url:'https://ilpost.it/tecnologia/feed/',
    filter:false, interval:null, digest:true, enabled:true },
  { id:3, type:'youtube', name:'MKBHD Channel',            url:'https://youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ',
    filter:false, interval:'1h', digest:false, enabled:true },
  { id:4, type:'news',    name:'Ars Technica',             url:'https://feeds.arstechnica.com/arstechnica/index',
    filter:true, interval:null, digest:false, enabled:false },
  { id:5, type:'podcast', name:'Darknet Diaries',          url:'https://feeds.megaphone.fm/darknetdiaries',
    filter:false, interval:null, digest:false, enabled:true },
  { id:6, type:'youtube', name:'Linus Tech Tips',          url:'https://youtube.com/feeds/videos.xml?channel_id=UCXuqSBlHAE6Xw-yeJA0Tunw',
    filter:false, interval:'30 min', digest:false, enabled:true },
];

const LOG_LINES_IDLE = [
  { t:'09:41:02', e:'🚀', msg:'Titan Desktop v1.9.0 initialized', level:'info' },
  { t:'09:41:02', e:'✅', msg:'Loaded bot profile: Runtime Radio Bot', level:'success' },
  { t:'09:41:03', e:'✅', msg:'Connected to Telegram API — getMe OK', level:'success' },
  { t:'09:41:04', e:'✅', msg:'Feed registry loaded (6 sources)', level:'success' },
  { t:'09:41:05', e:'📋', msg:'Ready. Waiting for ignition.', level:'info' },
];
const LOG_LINES_ACTIVE = [
  { t:'09:41:02', e:'🚀', msg:'Titan Desktop v1.9.0 initialized', level:'info' },
  { t:'09:41:02', e:'✅', msg:'Loaded bot profile: Runtime Radio Bot', level:'success' },
  { t:'09:41:12', e:'🚀', msg:'Ignition engaged — starting broadcast loop', level:'info' },
  { t:'09:41:13', e:'✅', msg:'Polling feed: Runtime Radio — The Show', level:'success' },
  { t:'09:41:14', e:'✅', msg:'Polling feed: Il Post — Tecnologia', level:'success' },
  { t:'09:41:15', e:'⚠️', msg:'YouTube API rate limit — retry in 30s', level:'warn' },
  { t:'09:41:22', e:'✅', msg:'New item: "Episodio 42 — Il futuro del broadcasting"', level:'success' },
  { t:'09:41:23', e:'✅', msg:'Posted to @runtimeradio (msg_id 18429)', level:'success' },
  { t:'09:41:31', e:'✅', msg:'Polling feed: Darknet Diaries', level:'success' },
  { t:'09:41:34', e:'❌', msg:'Feed error: Ars Technica (HTTP 503)', level:'error' },
  { t:'09:41:40', e:'✅', msg:'Digest queued: Il Post — 4 items pending', level:'success' },
  { t:'09:41:48', e:'✅', msg:'Posted to @runtimeradio (msg_id 18430)', level:'success' },
];

// ═══════════════════════════════════════════════════════════
function BotSelectorCol({ selectedId, showCreate=false }) {
  return (
    <div style={{width:288, height:'100%', background:T.dark950, borderRight:`1px solid rgba(59,130,246,0.10)`, display:'flex', flexDirection:'column'}}>
      {/* Header */}
      <div style={{height:48, padding:'0 14px', borderBottom:`1px solid rgba(59,130,246,0.08)`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontSize:10, letterSpacing:'0.2em', color:'rgba(59,130,246,0.5)', fontWeight:600}}>ACTIVE BOTS</div>
        <div style={{display:'flex', alignItems:'center', border:'1px solid rgba(59,130,246,0.15)', borderRadius:6, padding:2, background:'rgba(5,5,16,0.6)'}}>
          <button style={btnMicro}><I.SlidersHorizontal size={13} stroke={T.titan400}/></button>
          <div style={{width:1, height:12, background:'rgba(59,130,246,0.15)'}}/>
          <button style={btnMicro}><I.FileDown size={13} stroke={T.titan400}/></button>
          <div style={{width:1, height:12, background:'rgba(59,130,246,0.15)'}}/>
          <button style={btnMicro}><I.Plus size={13} stroke={T.titan400}/></button>
        </div>
      </div>
      {/* List */}
      <div style={{flex:1, overflow:'hidden', padding:'4px 0'}}>
        {showCreate && <CreateBotForm/>}
        {SAMPLE_BOTS.map(b => <BotRow key={b.id} bot={b} selected={b.id===selectedId}/>)}
      </div>
    </div>
  );
}
const btnMicro = { background:'transparent', border:'none', padding:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' };

function BotRow({ bot, selected }) {
  const borderColor = selected ? T.titan500 : 'transparent';
  const bg = selected ? 'rgba(59,130,246,0.06)' : 'transparent';
  return (
    <div style={{position:'relative', padding:'10px 12px 10px 14px', borderLeft:`2px solid ${borderColor}`, background:bg, cursor:'pointer'}}>
      <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
        <div style={{width:6, height:6, borderRadius:'50%', background: bot.active ? T.emerald : '#3f3f46', boxShadow: bot.active ? `0 0 6px ${T.emerald}` : 'none', flexShrink:0}}/>
        <div style={{fontSize:13, fontWeight:500, color: selected ? T.titan300 : (bot.active ? '#e0e7ff' : '#525252'), fontFamily:'Inter, sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1, minWidth:0, lineHeight:1.3}}>{bot.name}</div>
        {selected && <div style={{flexShrink:0}}><I.Check size={13} stroke={T.titan400}/></div>}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:4, marginTop:4, paddingLeft:14}}>
        <I.Hash size={9} stroke="#525252"/>
        <div style={{fontFamily:'Fira Code, monospace', fontSize:10, color:'#525252'}}>{bot.channel}</div>
      </div>
      <div style={{paddingLeft:14, marginTop:3, fontSize:9, letterSpacing:'-0.01em', color:'rgba(59,130,246,0.3)', fontWeight:700, textTransform:'uppercase'}}>
        From: {bot.date}
      </div>
    </div>
  );
}

function CreateBotForm() {
  return (
    <div style={{margin:'8px 10px 14px', padding:12, background:T.dark900, borderRadius:12, border:'1px solid rgba(59,130,246,0.20)'}}>
      <div style={{fontSize:10, letterSpacing:'0.2em', color:T.titan400, fontWeight:700, marginBottom:8}}>NEW BOT</div>
      {['BOT NAME','BOT TOKEN','CHANNEL ID','CUTOFF DATE'].map((lbl,i)=>(
        <div key={i} style={{marginBottom:8}}>
          <div style={{fontSize:9, letterSpacing:'0.18em', color:'rgba(59,130,246,0.5)', fontWeight:600, marginBottom:3}}>{lbl}</div>
          <input readOnly style={tinyInput}/>
        </div>
      ))}
      <div style={{display:'flex', gap:6, marginTop:10}}>
        <button style={{...pillBtn, flex:1, background:'rgba(59,130,246,0.15)', color:T.titan300, borderColor:'rgba(59,130,246,0.3)'}}>Save Bot</button>
        <button style={{...pillBtn, flex:1}}>Cancel</button>
      </div>
    </div>
  );
}
const tinyInput = { width:'100%', background:T.dark950, border:'1px solid rgba(59,130,246,0.15)', borderRadius:6, padding:'6px 8px', fontSize:11, color:'#e0e7ff', fontFamily:'Fira Code, monospace', outline:'none', boxSizing:'border-box' };
const pillBtn = { padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'#a3a3a3', fontSize:11, fontWeight:600, cursor:'pointer' };

// ═══════════════════════════════════════════════════════════
function FeedManagerCol({ expanded=false }) {
  return (
    <div style={{flex:1, minWidth:0, background:'rgba(10,10,15,0.3)', borderRight:`1px solid rgba(59,130,246,0.10)`, display:'flex', flexDirection:'column'}}>
      {/* Header */}
      <div style={{padding:'12px 14px', borderBottom:`1px solid rgba(59,130,246,0.08)`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:12, fontWeight:700, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap'}}>Feed Sources</div>
          <div style={{fontSize:10, color:'rgba(59,130,246,0.3)', marginTop:2, whiteSpace:'nowrap'}}>Manage RSS feeds</div>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button style={{...hdrBtn}}><I.Upload size={11} stroke="#a3a3a3"/><span>OPML</span></button>
          <button style={{...hdrBtn, background:'rgba(59,130,246,0.15)', borderColor:'rgba(59,130,246,0.20)', color:T.titan400}}>
            <I.Plus size={11} stroke={T.titan400}/><span>Add Source</span>
          </button>
        </div>
      </div>
      {/* List */}
      <div style={{flex:1, overflow:'hidden', padding:'14px 14px'}}>
        {expanded && <AddFeedForm/>}
        {SAMPLE_FEEDS.map(f => <FeedRow key={f.id} feed={f}/>)}
      </div>
    </div>
  );
}
const hdrBtn = { display:'flex', alignItems:'center', gap:5, padding:'6px 10px', borderRadius:8, background:T.dark950, border:'1px solid rgba(59,130,246,0.10)', fontSize:11, fontWeight:700, color:'#a3a3a3', cursor:'pointer', fontFamily:'Inter, sans-serif' };

function FeedRow({ feed }) {
  const typeMap = {
    podcast:{ color:T.purple, bg:'rgba(168,85,247,0.12)', border:'rgba(168,85,247,0.25)', label:'PODCAST', Icon:I.Rss },
    news:   { color:T.titan400, bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.25)', label:'NEWS', Icon:I.FileText },
    youtube:{ color:T.red, bg:'rgba(239,68,68,0.12)', border:'rgba(239,68,68,0.25)', label:'YOUTUBE', Icon:I.Play },
  };
  const t = typeMap[feed.type];
  const Ic = t.Icon;
  return (
    <div style={{padding:'10px 12px', marginBottom:8, background:'rgba(5,5,16,0.6)', borderRadius:12, border:'1px solid rgba(59,130,246,0.08)', display:'flex', alignItems:'center', gap:12}}>
      <div style={{width:36, height:36, borderRadius:8, background:t.bg, border:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
        <Ic size={16} stroke={t.color} fill={feed.type==='youtube'?t.color:'none'}/>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
          <div style={{fontSize:13, fontWeight:700, color:'#fff', fontFamily:'Inter, sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{feed.name}</div>
          <Chip color={t.color} border={t.border} bg={t.bg}>{t.label}</Chip>
          {feed.filter && <Chip color={T.amber} border="rgba(245,158,11,0.3)" bg="rgba(245,158,11,0.1)" icon={<I.Filter size={8} stroke={T.amber}/>}>filter active</Chip>}
          {feed.interval && <Chip color={T.cyan} border="rgba(6,182,212,0.3)" bg="rgba(6,182,212,0.1)" icon={<I.Clock size={8} stroke={T.cyan}/>}>{feed.interval}</Chip>}
          {feed.digest && <Chip color={T.violet} border="rgba(139,92,246,0.3)" bg="rgba(139,92,246,0.1)" icon={<I.BookOpen size={8} stroke={T.violet}/>}>digest</Chip>}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:5, marginTop:4}}>
          <I.Globe size={10} stroke="#525252"/>
          <div style={{fontFamily:'Fira Code, monospace', fontSize:10, color:'#525252', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{feed.url}</div>
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
        <Toggle on={feed.enabled}/>
      </div>
    </div>
  );
}
function Chip({ children, color, bg, border, icon }) {
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:3, padding:'2px 6px', borderRadius:4, background:bg, border:`1px solid ${border}`, color, fontSize:9, fontWeight:700, letterSpacing:'0.05em', fontFamily:'Inter, sans-serif', whiteSpace:'nowrap'}}>
      {icon}{children}
    </span>
  );
}
function Toggle({ on }) {
  return (
    <div style={{width:32, height:16, borderRadius:8, background: on ? 'rgba(59,130,246,0.25)' : T.dark950, border:`1px solid ${on?'rgba(59,130,246,0.4)':'rgba(59,130,246,0.1)'}`, position:'relative'}}>
      <div style={{width:10, height:10, borderRadius:'50%', background: on ? T.titan500 : '#525252', position:'absolute', top:2, left: on ? 18 : 2, boxShadow: on ? `0 0 6px ${T.titan500}` : 'none', transition:'left .2s'}}/>
    </div>
  );
}

function AddFeedForm() {
  return (
    <div style={{padding:14, marginBottom:10, background:T.dark950, borderRadius:12, border:'1px solid rgba(59,130,246,0.20)'}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10}}>
        <Field label="SOURCE NAME"><input readOnly defaultValue="Hacker News Front Page" style={tinyInput}/></Field>
        <Field label="SOURCE TYPE"><div style={{...tinyInput, display:'flex', alignItems:'center', justifyContent:'space-between'}}>News (Article)<span style={{color:'#525252'}}>▾</span></div></Field>
      </div>
      <Field label="FEED URL">
        <div style={{display:'flex', gap:6}}>
          <input readOnly defaultValue="https://hnrss.org/frontpage" style={tinyInput}/>
          <button style={{...hdrBtn, background:'rgba(59,130,246,0.15)', borderColor:'rgba(59,130,246,0.20)', color:T.titan400, padding:'6px 12px'}}>
            <I.Zap size={11} stroke={T.titan400}/><span>Test</span>
          </button>
        </div>
      </Field>
      <div style={{marginTop:8, padding:'8px 10px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:8, display:'flex', alignItems:'center', gap:6}}>
        <I.CheckCircle size={12} stroke={T.green}/>
        <span style={{fontSize:11, color:T.green, fontFamily:'Fira Code, monospace'}}>✅ Valid Feed — 30 elements found</span>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}>
        <Field label="CHECK INTERVAL"><div style={{...tinyInput, display:'flex', alignItems:'center', justifyContent:'space-between'}}>Bot default<span style={{color:'#525252'}}>▾</span></div></Field>
        <Field label="DIGEST MODE"><div style={{...tinyInput, display:'flex', alignItems:'center', justifyContent:'space-between'}}>Each article (default)<span style={{color:'#525252'}}>▾</span></div></Field>
      </div>
      <div style={{marginTop:10}}>
        <div style={{fontSize:9, letterSpacing:'0.18em', color:'rgba(59,130,246,0.5)', fontWeight:600, marginBottom:3}}>KEYWORD FILTER</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          <input readOnly placeholder="Include — e.g. AI, technology" style={{...tinyInput, border:`1px solid rgba(16,185,129,0.3)`}}/>
          <input readOnly placeholder="Exclude — e.g. crypto" style={{...tinyInput, border:`1px solid rgba(239,68,68,0.3)`}}/>
        </div>
      </div>
      <div style={{display:'flex', justifyContent:'flex-end', gap:6, marginTop:12}}>
        <button style={pillBtn}>Cancel</button>
        <button style={{...pillBtn, background:'rgba(59,130,246,0.15)', color:T.titan300, borderColor:'rgba(59,130,246,0.3)'}}>Save Feed</button>
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div>
      <div style={{fontSize:9, letterSpacing:'0.18em', color:'rgba(59,130,246,0.5)', fontWeight:600, marginBottom:3}}>{label}</div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
function ConsoleCol({ state='idle', logs, botName='Runtime Radio Bot' }) {
  const isActive = state==='active';
  const isEmpty = state==='empty';
  if (isEmpty) {
    return (
      <div style={{flex:1, background:T.dark900, display:'flex', alignItems:'center', justifyContent:'center', ...gridDotsStyle}}>
        <div style={{fontSize:11, letterSpacing:'0.3em', color:'rgba(59,130,246,0.4)', textTransform:'uppercase', fontWeight:600}}>
          Select a bot to view console.
        </div>
      </div>
    );
  }
  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', background:T.dark900, minWidth:0}}>
      {/* Header */}
      <div style={{padding:'10px 18px', borderBottom:'1px solid rgba(59,130,246,0.10)', background:'rgba(10,10,15,0.8)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:32, height:32, borderRadius:7, background:'linear-gradient(135deg, #1e3a8a, #172554)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 12px rgba(59,130,246,0.3)', border:'1px solid rgba(59,130,246,0.3)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24"><polygon points="12,3 21,8 21,16 12,21 3,16 3,8" fill="none" stroke={T.titan300} strokeWidth="1.5"/><circle cx="12" cy="12" r="3" fill={T.titan400}/></svg>
          </div>
          <div>
            <div style={{lineHeight:1.1}}>
              <span style={{fontSize:16, fontWeight:800, color:'#fff', letterSpacing:'0.02em', textTransform:'uppercase', fontFamily:'Inter, sans-serif'}}>Runtime TelegramBot</span>
              <span style={{marginLeft:8, fontSize:15, fontWeight:300, color:T.titan400, fontFamily:'Inter, sans-serif'}}>Titan Edition</span>
            </div>
            <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:2}}>
              <span style={{fontSize:9, color:'#525252'}}>© 2026 Simone Pizzi for Runtime Radio</span>
              <span style={{fontSize:8, color:'rgba(59,130,246,0.4)', fontFamily:'Fira Code, monospace'}}>v1.9.0</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <StatusPill online={isActive || state==='idle'}/>
          <div style={{width:1, height:20, background:'rgba(59,130,246,0.1)'}}/>
          <button style={{...btnMicro, padding:7, borderRadius:6, border:'1px solid rgba(59,130,246,0.12)', background:T.dark950}}>
            <I.Settings size={14} stroke={T.titan400}/>
          </button>
        </div>
      </div>

      {/* Stats + Ignition */}
      <div style={{padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'center', gap:28}}>
        <StatBlock label="Today" value="24" color={T.titan400}/>
        <div style={{width:1, height:36, background:'rgba(59,130,246,0.1)'}}/>
        <StatBlock label="7 Days" value="186" color={T.titan300}/>
        <IgnitionBtn active={isActive}/>
        <StatBlock label="Total" value="8,491" color="#a3a3a3" bigMuted/>
        <div style={{width:1, height:36, background:'rgba(59,130,246,0.1)'}}/>
        <button style={{background:'transparent', border:'none', display:'flex', alignItems:'center', gap:5, cursor:'pointer'}}>
          <I.BarChart3 size={12} stroke={T.titan400}/>
          <span style={{fontSize:9, letterSpacing:'0.2em', fontWeight:700, color:T.titan400, textTransform:'uppercase'}}>Stats</span>
        </button>
      </div>

      {/* Log Panel */}
      <div style={{flex:1, minHeight:0, margin:'0 18px 18px', borderRadius:12, background:'rgba(5,5,16,0.9)', ...panelBorder, overflow:'hidden', display:'flex', flexDirection:'column', position:'relative'}}>
        {/* scanline overlay */}
        <div style={{position:'absolute', inset:0, ...scanlineStyle, pointerEvents:'none'}}/>
        {/* log header */}
        <div style={{padding:'8px 14px', borderBottom:'1px solid rgba(59,130,246,0.1)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{fontSize:10, letterSpacing:'0.25em', fontWeight:700, color:'#a3a3a3', textTransform:'uppercase', fontFamily:'Inter, sans-serif'}}>System Logs // All Channels</div>
            <div style={{display:'flex', padding:2, background:'rgba(5,5,16,0.8)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:5}}>
              <div style={{padding:'2px 8px', fontSize:9, fontWeight:700, color:T.titan400, background:'rgba(59,130,246,0.2)', borderRadius:3, letterSpacing:'0.05em'}}>All Bots</div>
              <div style={{padding:'2px 8px', fontSize:9, fontWeight:700, color:'#525252', letterSpacing:'0.05em'}}>This Bot</div>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <button style={logBtn}><I.Download size={10} stroke="currentColor"/><span>Export</span></button>
            <span style={{color:'#292929'}}>|</span>
            <button style={logBtn}>Clear</button>
          </div>
        </div>
        {/* log body */}
        <div style={{flex:1, overflow:'hidden', padding:'10px 14px', position:'relative', zIndex:1, fontFamily:'Fira Code, monospace', fontSize:11}}>
          {(logs||[]).map((l,i)=>(
            <div key={i} style={{padding:'2px 0', color: logColor(l.level), whiteSpace:'pre', overflow:'hidden', textOverflow:'ellipsis'}}>
              <span style={{color:'#525252'}}>[{l.t}]</span> <span>{l.e}</span> {l.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const logBtn = { background:'transparent', border:'none', color:'#a3a3a3', fontSize:10, letterSpacing:'0.15em', fontWeight:700, textTransform:'uppercase', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 };
function logColor(lv) {
  return lv==='success' ? '#4ade80' : lv==='error' ? '#f87171' : lv==='warn' ? '#eab308' : '#dbeafe';
}

function StatusPill({ online }) {
  if (online) return (
    <div style={{display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:6, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)'}}>
      <div style={{width:6, height:6, borderRadius:'50%', background:T.titan400, boxShadow:`0 0 8px ${T.titan400}`}}/>
      <span style={{fontSize:10, fontWeight:700, color:T.titan400, letterSpacing:'0.15em'}}>ONLINE</span>
    </div>
  );
  return (
    <div style={{display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:6, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)'}}>
      <div style={{width:6, height:6, borderRadius:'50%', background:T.red}}/>
      <span style={{fontSize:10, fontWeight:700, color:'#fca5a5', letterSpacing:'0.15em'}}>OFFLINE</span>
    </div>
  );
}
function StatBlock({ label, value, color, bigMuted }) {
  return (
    <div style={{textAlign:'center'}}>
      <div style={{fontSize:22, fontWeight:700, color, lineHeight:1, fontFamily:'Inter, sans-serif'}}>{value}</div>
      <div style={{fontSize:8, fontWeight:700, letterSpacing:'0.25em', color:'#525252', textTransform:'uppercase', marginTop:4}}>{label}</div>
    </div>
  );
}
function IgnitionBtn({ active }) {
  return (
    <div style={{position:'relative', width:80, height:80}}>
      {active && <div style={{position:'absolute', inset:-8, borderRadius:18, border:'1px solid rgba(59,130,246,0.2)', boxShadow:'0 0 25px rgba(59,130,246,0.4)'}}/>}
      {/* conic ring */}
      <div style={{position:'absolute', inset:-2, borderRadius:16, background: active
        ? `conic-gradient(from 0deg, ${T.titan500}, transparent 40%, ${T.titan400}, transparent 80%, ${T.titan500})`
        : `conic-gradient(from 0deg, rgba(59,130,246,0.15), transparent 30%, rgba(59,130,246,0.1), transparent 70%)`,
        opacity: active ? 0.7 : 0.4}}/>
      <div style={{position:'absolute', inset:0, borderRadius:16, background: active
        ? `linear-gradient(135deg, ${T.titan600}, ${T.titan800})`
        : `linear-gradient(135deg, ${T.dark700}, ${T.dark900})`,
        border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(59,130,246,0.2)',
        boxShadow: active ? '0 0 30px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
        display:'flex', alignItems:'center', justifyContent:'center'}}>
        {active
          ? <I.Square size={22} stroke="#fff" fill="#fff"/>
          : <I.Play size={24} stroke={T.titan400} fill={T.titan400}/>}
      </div>
    </div>
  );
}

function Dashboard({ state='idle', showCreate=false, feedFormOpen=false }) {
  const logs = state==='active' ? LOG_LINES_ACTIVE : LOG_LINES_IDLE;
  const selId = state==='empty' ? null : 1;
  return (
    <div style={{width:1280, height:800, background:T.dark950, color:'#e0e7ff', fontFamily:'Inter, sans-serif', display:'flex', overflow:'hidden'}}>
      {/* Left 50% */}
      <div style={{width:'50%', display:'flex'}}>
        <BotSelectorCol selectedId={selId} showCreate={showCreate}/>
        <FeedManagerCol expanded={feedFormOpen}/>
      </div>
      {/* Right 50% */}
      <div style={{width:'50%'}}>
        <ConsoleCol state={state} logs={logs}/>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, FeedManagerCol, BotSelectorCol, ConsoleCol });
