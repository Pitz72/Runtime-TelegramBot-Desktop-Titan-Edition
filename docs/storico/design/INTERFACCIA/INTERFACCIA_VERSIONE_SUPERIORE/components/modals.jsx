// Modals and overlay frames

function ModalShell({ w=560, h, title, subtitle, IconEl, iconColor=T.titan400, children, footer }) {
  return (
    <div style={{width:1280, height:800, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif', color:'#e0e7ff', position:'relative'}}>
      {/* faint dashboard behind */}
      <div style={{position:'absolute', inset:0, ...gridDotsStyle, opacity:0.3}}/>
      <div style={{width:w, maxHeight:720, background:T.dark900, border:'1px solid rgba(59,130,246,0.15)', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.6), 0 0 80px rgba(59,130,246,0.05)', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', zIndex:1}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid rgba(59,130,246,0.1)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            {IconEl && <div style={{width:36, height:36, borderRadius:8, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center'}}>{IconEl}</div>}
            <div>
              <div style={{fontSize:19, fontWeight:700, color:'#fff'}}>{title}</div>
              {subtitle && <div style={{fontSize:10, color:'rgba(59,130,246,0.4)', fontFamily:'Fira Code, monospace', marginTop:2}}>{subtitle}</div>}
            </div>
          </div>
          <button style={{...btnMicro, padding:8, borderRadius:6}}><I.X size={16} stroke="#a3a3a3"/></button>
        </div>
        <div style={{flex:1, overflow:'hidden', padding:22}}>{children}</div>
        {footer && <div style={{padding:'14px 22px', borderTop:'1px solid rgba(59,130,246,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(5,5,16,0.5)'}}>{footer}</div>}
      </div>
    </div>
  );
}

// ── 7.1 Bot Settings — General ─────────────────────────────
function BotSettingsGeneral() {
  const [tab, setTab] = ['general', ()=>{}];
  return (
    <ModalShell
      w={960}
      title="Edit Bot"
      subtitle={<>Edit: <span style={{color:T.titan400}}>Runtime Radio Bot</span></>}
      IconEl={<I.Settings size={18} stroke={T.titan400}/>}
      footer={
        <>
          <button style={{...pillBtn, color:'rgba(248,113,113,0.8)', borderColor:'rgba(239,68,68,0.2)', display:'flex', alignItems:'center', gap:6}}>
            <I.Trash2 size={13} stroke="rgba(248,113,113,0.8)"/>Delete Bot
          </button>
          <div style={{display:'flex', gap:8}}>
            <button style={pillBtn}>Cancel</button>
            <button style={{...pillBtn, background:T.titan600, color:'#fff', borderColor:T.titan500, display:'flex', alignItems:'center', gap:6, boxShadow:'0 0 15px rgba(59,130,246,0.25)'}}>
              <I.Save size={13} stroke="#fff"/>Save Bot
            </button>
          </div>
        </>
      }>
      <TabStrip tabs={['General','Templates']} active="General" icons={[I.Settings, I.LayoutTemplate]}/>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginTop:18}}>
        {/* LEFT */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <Field label="BOT LABEL / NAME"><input readOnly defaultValue="Runtime Radio Bot" style={tinyInput}/></Field>
          <Field label="TELEGRAM BOT TOKEN">
            <div style={{position:'relative'}}>
              <input readOnly defaultValue="123456:ABC-DefGhiJklmNoPqRsTuVwXyZ" style={{...tinyInput, paddingRight:30}}/>
              <div style={{position:'absolute', right:8, top:6, color:'#525252'}}><I.Eye size={14} stroke="#525252"/></div>
            </div>
          </Field>
          <Field label="DESTINATION CHANNEL ID"><input readOnly defaultValue="@runtimeradio" style={tinyInput}/></Field>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <Field label="CUTOFF DATE"><input readOnly defaultValue="2026-01-12" style={tinyInput}/></Field>
            <Field label="BOT ACTIVE">
              <div style={toggleTile(true)}>
                <div style={{width:7, height:7, borderRadius:'50%', background:T.titan400, boxShadow:`0 0 6px ${T.titan400}`}}/>
                <span style={{fontSize:11, color:T.titan300, fontWeight:600}}>Active</span>
              </div>
            </Field>
          </div>
          <Field label="DESKTOP NOTIFICATIONS">
            <div style={toggleTile(true)}>
              <div style={{width:7, height:7, borderRadius:'50%', background:T.titan400, boxShadow:`0 0 6px ${T.titan400}`}}/>
              <span style={{fontSize:11, color:T.titan300, fontWeight:600}}>Enabled</span>
            </div>
          </Field>
        </div>
        {/* RIGHT */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div>
            <div style={miniLabel}>CHECK INTERVAL</div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{flex:1, height:4, background:T.dark950, borderRadius:2, position:'relative'}}>
                <div style={{position:'absolute', left:0, top:0, height:4, width:'22%', background:`linear-gradient(to right, ${T.titan600}, ${T.titan400})`, borderRadius:2, boxShadow:`0 0 8px ${T.titan500}`}}/>
                <div style={{position:'absolute', left:'22%', top:-4, width:12, height:12, borderRadius:'50%', background:T.titan400, boxShadow:`0 0 10px ${T.titan400}`, marginLeft:-6}}/>
              </div>
              <div style={{minWidth:80, textAlign:'center', padding:'6px 10px', background:T.dark950, border:'1px solid rgba(59,130,246,0.2)', borderRadius:6, fontFamily:'Fira Code, monospace', fontSize:12, color:T.titan300, fontWeight:600}}>27 min</div>
            </div>
          </div>
          <div>
            <div style={miniLabel}>ACTIVE HOURS</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <div>
                <div style={{fontSize:9, color:'#525252', letterSpacing:'0.2em', fontWeight:700, marginBottom:3}}>FROM</div>
                <input readOnly defaultValue="08:00" style={{...tinyInput, textAlign:'center'}}/>
              </div>
              <div>
                <div style={{fontSize:9, color:'#525252', letterSpacing:'0.2em', fontWeight:700, marginBottom:3}}>TO</div>
                <input readOnly defaultValue="23:00" style={{...tinyInput, textAlign:'center'}}/>
              </div>
            </div>
            <div style={{fontSize:10, color:'#525252', marginTop:6}}>Bot will not post outside these hours.</div>
          </div>
          {/* DANGER ZONE */}
          <div style={{borderTop:'1px solid rgba(239,68,68,0.25)', paddingTop:12, marginTop:6}}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
              <I.AlertTriangle size={12} stroke="#f87171"/>
              <div style={{fontSize:10, letterSpacing:'0.2em', fontWeight:700, color:'#f87171', textTransform:'uppercase'}}>Danger Zone</div>
            </div>
            <div style={{padding:12, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10}}>
              <div style={{fontSize:12, fontWeight:700, color:'#fca5a5'}}>Clear Broadcast History</div>
              <div style={{fontSize:10, color:'#a3a3a3', marginTop:3, lineHeight:1.5}}>The bot will forget what it sent.<br/>USE WITH CAUTION!</div>
              <button style={{marginTop:10, ...pillBtn, background:'rgba(239,68,68,0.12)', color:'#fca5a5', borderColor:'rgba(239,68,68,0.3)', display:'inline-flex', alignItems:'center', gap:5}}>
                <I.Database size={11} stroke="#fca5a5"/>Clear History
              </button>
            </div>
          </div>
          {/* SHARING */}
          <div style={{borderTop:'1px solid rgba(59,130,246,0.25)', paddingTop:12}}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
              <I.Download size={12} stroke={T.titan400}/>
              <div style={{fontSize:10, letterSpacing:'0.2em', fontWeight:700, color:T.titan400, textTransform:'uppercase'}}>Sharing</div>
            </div>
            <div style={{padding:12, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:10}}>
              <div style={{fontSize:12, fontWeight:700, color:T.titan300}}>Export to .rtb</div>
              <div style={{fontSize:10, color:'#a3a3a3', marginTop:3}}>Portable profile bundle you can share.</div>
              <button style={{marginTop:10, ...pillBtn, background:'rgba(59,130,246,0.12)', color:T.titan300, borderColor:'rgba(59,130,246,0.3)', display:'inline-flex', alignItems:'center', gap:5}}>
                <I.Download size={11} stroke={T.titan300}/>Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
const miniLabel = { fontSize:9, letterSpacing:'0.2em', color:'rgba(59,130,246,0.5)', fontWeight:700, marginBottom:6, textTransform:'uppercase' };
const toggleTile = (on) => ({
  display:'flex', alignItems:'center', gap:8, padding:'7px 12px',
  background: on ? 'rgba(59,130,246,0.1)' : T.dark950,
  border:`1px solid ${on?'rgba(59,130,246,0.3)':'rgba(59,130,246,0.1)'}`,
  borderRadius:6, cursor:'pointer',
});

function TabStrip({ tabs, active, icons=[] }) {
  return (
    <div style={{display:'flex', gap:0, borderBottom:'1px solid rgba(59,130,246,0.1)'}}>
      {tabs.map((t, i) => {
        const Ic = icons[i];
        const on = t===active;
        return (
          <div key={t} style={{display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderBottom: on ? `2px solid ${T.titan500}` : '2px solid transparent', color: on ? '#fff' : '#525252', fontSize:12, fontWeight:600, cursor:'pointer'}}>
            {Ic && <Ic size={12} stroke={on ? T.titan400 : '#525252'}/>}
            {t}
          </div>
        );
      })}
    </div>
  );
}

// ── 7.1b Bot Settings — Templates ──────────────────────────
function BotSettingsTemplates() {
  return (
    <ModalShell w={960}
      title="Edit Bot"
      subtitle={<>Edit: <span style={{color:T.titan400}}>Runtime Radio Bot</span></>}
      IconEl={<I.Settings size={18} stroke={T.titan400}/>}
      footer={
        <>
          <button style={{...pillBtn, color:'rgba(248,113,113,0.8)', borderColor:'rgba(239,68,68,0.2)', display:'flex', alignItems:'center', gap:6}}>
            <I.Trash2 size={13} stroke="rgba(248,113,113,0.8)"/>Delete Bot
          </button>
          <div style={{display:'flex', gap:8}}>
            <button style={pillBtn}>Cancel</button>
            <button style={{...pillBtn, background:T.titan600, color:'#fff', borderColor:T.titan500, display:'flex', alignItems:'center', gap:6}}>
              <I.Save size={13} stroke="#fff"/>Save Bot
            </button>
          </div>
        </>
      }>
      <TabStrip tabs={['General','Templates']} active="Templates" icons={[I.Settings, I.LayoutTemplate]}/>
      <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:10, maxHeight:540, overflow:'hidden'}}>
        <TemplateEditor title="Startup Message Template" hideChips
          body={`🚀 <b>Titan Online</b>\nBroadcasting from {Sorgente} — ready to listen!`}/>
        <TemplateEditor title="News Template"
          body={`📰 <b>{Titolo}</b>\n<i>from {Sorgente}</i>\n\n{Sommario}\n\n🔗 {Link}`}/>
        <TemplateEditor title="Podcast Template"
          body={`🎙 <b>{Titolo}</b>\n<i>{Sorgente}</i>\n\n{Sommario}\n\n▶ {Link}`}/>
        <TemplateEditor title="YouTube Template"
          body={`▶ <b>{Titolo}</b>\n<i>{Sorgente}</i>\n\n🔗 {Link}`}/>
      </div>
    </ModalShell>
  );
}
function TemplateEditor({ title, body, hideChips }) {
  return (
    <div style={{background:T.dark900, borderRadius:12, padding:12, border:'1px solid rgba(59,130,246,0.1)'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <div style={{fontSize:12, fontWeight:700, color:T.titan400, letterSpacing:'0.02em'}}>{title}</div>
        {!hideChips && (
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{fontSize:10, color:'#525252'}}>Insert variable:</span>
            {['Titolo','Sorgente','Link','Sommario'].map(v => (
              <span key={v} style={{padding:'2px 8px', borderRadius:4, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:T.titan300, fontSize:10, fontFamily:'Fira Code, monospace', cursor:'pointer'}}>
                [{v}]
              </span>
            ))}
          </div>
        )}
        {hideChips && (
          <button style={{...pillBtn, display:'inline-flex', alignItems:'center', gap:5}}>
            <I.Eye size={11} stroke="#a3a3a3"/>Preview
          </button>
        )}
      </div>
      <div style={{background:T.dark950, border:'1px solid rgba(59,130,246,0.15)', borderRadius:8, padding:'8px 10px', minHeight:60, fontFamily:'Fira Code, monospace', fontSize:11, color:'#e0e7ff', whiteSpace:'pre-wrap', lineHeight:1.55}}>
        {body}
      </div>
      <div style={{marginTop:6, display:'flex', alignItems:'center', gap:6}}>
        <I.CheckCircle size={11} stroke={T.green}/>
        <span style={{fontSize:10, color:T.green}}>Template valid — no issues detected</span>
      </div>
      <div style={{fontSize:10, color:'#525252', marginTop:4}}>Supports basic Telegram HTML (&lt;b&gt;, &lt;i&gt;, &lt;a&gt;)...</div>
    </div>
  );
}

// ── 7.2 System Settings ────────────────────────────────────
function SystemSettings() {
  const flags = [
    ['EN','English'], ['IT','Italiano'], ['FR','Français'], ['DE','Deutsch'],
    ['ES','Español'], ['PT','Português'], ['RU','Русский'], ['ZH','中文'],
  ];
  return (
    <ModalShell w={960}
      title="System Settings"
      subtitle="Data and Database Management"
      IconEl={<I.Shield size={20} stroke={T.titan400}/>}
      footer={
        <div style={{marginLeft:'auto'}}>
          <button style={{...pillBtn, background:T.titan600, color:'#fff', borderColor:T.titan500}}>Close</button>
        </div>
      }>
      <TabStrip tabs={['General','Data & Backup']} active="General" icons={[I.Settings, I.Database]}/>
      <div style={{marginTop:22}}>
        <div style={{fontSize:11, letterSpacing:'0.25em', fontWeight:700, color:T.titan400, textTransform:'uppercase', marginBottom:12}}>Interface Language</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gap:10}}>
          {flags.map(([code,name], i) => {
            const sel = code==='IT';
            return (
              <div key={code} style={{padding:14, borderRadius:10, background: sel ? 'rgba(59,130,246,0.15)' : T.dark950, border: sel ? `1px solid rgba(59,130,246,0.5)` : '1px solid rgba(59,130,246,0.1)', boxShadow: sel ? `0 0 0 1px rgba(59,130,246,0.5), 0 0 20px rgba(59,130,246,0.15)` : 'none', textAlign:'center', opacity: sel ? 1 : 0.5, cursor:'pointer'}}>
                <div style={{display:'flex', justifyContent:'center'}}><FlagTile code={code}/></div>
                <div style={{marginTop:6, fontSize:10, fontWeight:700, color: sel ? '#fff' : '#a3a3a3', letterSpacing:'0.1em'}}>{code}</div>
              </div>
            );
          })}
        </div>
        {/* Data & Backup preview below (per §12 we only produce one variant; but spec lists separate frames) */}
        <div style={{marginTop:28, borderTop:'1px solid rgba(59,130,246,0.08)', paddingTop:22}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:22}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:10}}>
                <I.Database size={12} stroke={T.titan400}/>
                <div style={{fontSize:11, letterSpacing:'0.25em', fontWeight:700, color:T.titan400, textTransform:'uppercase'}}>Database Management</div>
              </div>
              <div style={{fontSize:11, color:'#a3a3a3', lineHeight:1.6, marginBottom:12}}>Full database backup or restore. Titan will restart after import.</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <BigActionBtn tint="titan" Icon={I.Download} label="Export DB" caption="Save titan.db"/>
                <BigActionBtn tint="amber" Icon={I.Upload} label="Import DB" caption="Requires restart"/>
              </div>
            </div>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:10}}>
                <I.FileJson size={12} stroke={T.titan400}/>
                <div style={{fontSize:11, letterSpacing:'0.25em', fontWeight:700, color:T.titan400, textTransform:'uppercase'}}>Bot Profiles (.rtb)</div>
              </div>
              <div style={{fontSize:11, color:'#a3a3a3', lineHeight:1.6, marginBottom:12}}>Export all bots or import existing profiles as a single .rtb bundle.</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <BigActionBtn tint="titan" Icon={I.Download} label="Export All" caption="Save a single .rtb file"/>
                <BigActionBtn tint="green" Icon={I.Upload} label="Import" caption="Adds existing bots"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
function BigActionBtn({ tint, Icon, label, caption }) {
  const map = {
    titan: { bg:'rgba(59,130,246,0.08)', bd:'rgba(59,130,246,0.25)', fg:T.titan300 },
    amber: { bg:'rgba(245,158,11,0.08)', bd:'rgba(245,158,11,0.25)', fg:'#fbbf24' },
    green: { bg:'rgba(16,185,129,0.08)', bd:'rgba(16,185,129,0.25)', fg:'#4ade80' },
  };
  const c = map[tint];
  return (
    <div style={{padding:14, borderRadius:10, background:c.bg, border:`1px solid ${c.bd}`, textAlign:'left', cursor:'pointer'}}>
      <Icon size={16} stroke={c.fg}/>
      <div style={{fontSize:12, fontWeight:700, color:c.fg, marginTop:8}}>{label}</div>
      <div style={{fontSize:10, color:'#a3a3a3', marginTop:2}}>{caption}</div>
    </div>
  );
}

// ── 7.3 Stats ──────────────────────────────────────────────
function StatsModal() {
  const feeds = [
    { name:'Runtime Radio — The Show', today:4, total:1824, pct:100 },
    { name:'Il Post — Tecnologia',     today:6, total:1240, pct:68  },
    { name:'MKBHD Channel',            today:2, total:742,  pct:41  },
    { name:'Ars Technica',             today:3, total:611,  pct:34  },
    { name:'Darknet Diaries',          today:1, total:312,  pct:17  },
    { name:'Linus Tech Tips',          today:2, total:275,  pct:15  },
  ];
  return (
    <ModalShell w={520}
      title="Detailed Statistics"
      subtitle="Runtime Radio Bot"
      IconEl={<I.BarChart3 size={18} stroke={T.titan400}/>}
      footer={<div style={{marginLeft:'auto'}}><button style={{...pillBtn, background:T.titan600, color:'#fff', borderColor:T.titan500}}>Close</button></div>}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20}}>
        {[['Today','24',T.titan400],['7 Days','186',T.titan300],['Total','8,491','#a3a3a3']].map(([lbl,val,c])=>(
          <div key={lbl} style={{padding:14, background:T.dark950, border:'1px solid rgba(59,130,246,0.1)', borderRadius:12, textAlign:'center'}}>
            <div style={{fontSize:24, fontWeight:700, color:c, lineHeight:1}}>{val}</div>
            <div style={{fontSize:9, fontWeight:700, letterSpacing:'0.25em', color:'#525252', textTransform:'uppercase', marginTop:6}}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:5, marginBottom:10}}>
        <I.TrendingUp size={11} stroke={T.titan400}/>
        <div style={{fontSize:10, letterSpacing:'0.25em', fontWeight:700, color:T.titan400, textTransform:'uppercase'}}>Published by Feed</div>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:6, maxHeight:260, overflow:'hidden'}}>
        {feeds.map((f,i)=>(
          <div key={i} style={{padding:'10px 12px', background:'rgba(5,5,16,0.6)', borderRadius:8, border:'1px solid rgba(59,130,246,0.08)'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{fontSize:12, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, paddingRight:10}}>{f.name}</div>
              <div style={{display:'flex', gap:10, fontFamily:'Fira Code, monospace'}}>
                <span style={{fontSize:10, color:T.titan400, fontWeight:700}}>+{f.today} Today</span>
                <span style={{fontSize:10, color:'#525252', fontWeight:700}}>{f.total} Total</span>
              </div>
            </div>
            <div style={{marginTop:6, height:3, background:T.dark800, borderRadius:2, overflow:'hidden'}}>
              <div style={{height:'100%', width:`${f.pct}%`, background:`linear-gradient(to right, ${T.titan600}, ${T.titan400})`, borderRadius:2}}/>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

// ── 7.4 Confirm Dialog ─────────────────────────────────────
function ConfirmDialog() {
  return (
    <div style={{width:1280, height:800, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif', color:'#e0e7ff'}}>
      <div style={{width:460, background:'#0d1117', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:36, height:36, borderRadius:8, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <I.AlertTriangle size={18} stroke={T.amber}/>
            </div>
            <div style={{fontSize:17, fontWeight:700, color:'#fff'}}>Clear Broadcast History?</div>
          </div>
          <button style={{...btnMicro, padding:6}}><I.X size={14} stroke="#a3a3a3"/></button>
        </div>
        <div style={{padding:22}}>
          <div style={{fontSize:13, color:'#d1d5db', lineHeight:1.6}}>
            This will permanently erase the broadcast memory for <span style={{color:T.titan300, fontWeight:600}}>Runtime Radio Bot</span>.<br/><br/>
            The bot will re-post any feed items it has already broadcast. This action cannot be undone.
          </div>
        </div>
        <div style={{padding:'14px 22px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'flex-end', gap:8}}>
          <button style={pillBtn}>Cancel</button>
          <button style={{...pillBtn, background:'rgba(239,68,68,0.15)', color:'#fca5a5', borderColor:'rgba(239,68,68,0.4)', boxShadow:'0 0 15px rgba(239,68,68,0.2)'}}>Clear History</button>
        </div>
      </div>
    </div>
  );
}

// ── 7.5 Toast stack ────────────────────────────────────────
function ToastStack() {
  const toasts = [
    { t:'success', title:'Bot saved', msg:'Runtime Radio Bot configuration updated.' },
    { t:'error',   title:'Feed error', msg:'Ars Technica returned HTTP 503 — will retry in 30s.' },
    { t:'info',    title:'New Version Available', msg:'Titan Edition v1.9.1 is available! Go to the portal to download the update.' },
  ];
  const stripe = { success:T.emerald, error:T.red, warning:T.amber, info:T.titan500 };
  const Icons = { success:I.CheckCircle, error:I.AlertCircle, warning:I.AlertTriangle, info:I.Info };
  const tint = { success:T.green, error:'#f87171', warning:T.amber, info:T.titan400 };
  // faint dashboard behind
  return (
    <div style={{width:1280, height:800, background:T.dark950, position:'relative', overflow:'hidden', fontFamily:'Inter, sans-serif', color:'#e0e7ff'}}>
      <div style={{position:'absolute', inset:0, ...gridDotsStyle, opacity:0.4}}/>
      <div style={{position:'absolute', bottom:24, right:24, display:'flex', flexDirection:'column', gap:10, zIndex:2}}>
        {toasts.map((t,i)=>{
          const Ic = Icons[t.t];
          return (
            <div key={i} style={{width:340, background:'rgba(22,27,34,0.9)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, overflow:'hidden', display:'flex', boxShadow:'0 10px 40px rgba(0,0,0,0.5)'}}>
              <div style={{width:4, background:stripe[t.t]}}/>
              <div style={{flex:1, padding:'12px 14px', display:'flex', gap:10}}>
                <Ic size={18} stroke={tint[t.t]}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12, fontWeight:700, color:'#fff'}}>{t.title}</div>
                  <div style={{fontSize:11, color:'#a3a3a3', marginTop:3, lineHeight:1.5}}>{t.msg}</div>
                </div>
                <button style={{...btnMicro, padding:2, alignSelf:'flex-start'}}><I.X size={12} stroke="#525252"/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 7.6 ErrorBoundary ──────────────────────────────────────
function ErrorScreen() {
  return (
    <div style={{width:1280, height:800, background:T.dark950, ...gridDotsStyle, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif', color:'#e0e7ff'}}>
      <div style={{width:680, background:'rgba(10,10,15,0.8)', backdropFilter:'blur(20px)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:18, padding:32, boxShadow:'inset 0 0 40px rgba(239,68,68,0.05), 0 20px 60px rgba(0,0,0,0.6)'}}>
        <div style={{display:'flex', alignItems:'center', gap:18, marginBottom:22}}>
          <div style={{width:56, height:56, borderRadius:12, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <I.AlertTriangle size={32} stroke="#f87171"/>
          </div>
          <div>
            <div style={{fontSize:22, fontWeight:900, color:'#fff', letterSpacing:'0.02em', textTransform:'uppercase'}}>Critical System Error</div>
            <div style={{fontSize:10, fontWeight:600, color:'rgba(239,68,68,0.6)', letterSpacing:'0.25em', textTransform:'uppercase', marginTop:4}}>Interface Termination Detected</div>
          </div>
        </div>
        <div style={{fontSize:13, color:'#fca5a5', lineHeight:1.6, marginBottom:18}}>
          Titan encountered an unrecoverable rendering fault and cannot continue. The broadcast daemon is still running in the background — your bots will keep posting.
        </div>
        <div style={{background:'rgba(0,0,0,0.4)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'12px 14px', fontFamily:'Fira Code, monospace', fontSize:11, color:'#f87171', marginBottom:20}}>
          TypeError: Cannot read properties of undefined (reading &apos;channel_id&apos;)
          <div style={{color:'#525252', marginTop:4}}>  at BotRow.render (bot-selector.jsx:184:31)</div>
        </div>
        <button style={{width:'100%', padding:'12px 16px', borderRadius:10, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', color:'#fca5a5', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 0 20px rgba(239,68,68,0.2)'}}>
          <I.RefreshCw size={16} stroke="#fca5a5"/> Reload Interface
        </button>
        <div style={{textAlign:'center', marginTop:16, fontSize:10, letterSpacing:'0.25em', color:'rgba(59,130,246,0.4)', textTransform:'uppercase', fontWeight:600}}>Titan Desktop Safety Protocol Active</div>
      </div>
    </div>
  );
}

// ── 9.1 IntroScreen ────────────────────────────────────────
function IntroScreen() {
  const flags = [
    ['EN','English'], ['IT','Italiano'], ['FR','Français'], ['DE','Deutsch'],
    ['ES','Español'], ['PT','Português'], ['RU','Русский'], ['ZH','中文'],
  ];
  return (
    <div style={{width:1280, height:800, background:T.dark900, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif', color:'#e0e7ff', position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', left:'50%', top:'50%', width:600, height:600, transform:'translate(-50%,-50%)', background:'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)'}}/>
      <div style={{position:'relative', zIndex:1, maxWidth:640, textAlign:'center'}}>
        <div style={{width:112, height:112, margin:'0 auto 20px', borderRadius:24, background:'linear-gradient(135deg, #1e3a8a, #172554)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 40px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)', border:'1px solid rgba(59,130,246,0.3)'}}>
          <svg width="56" height="56" viewBox="0 0 24 24"><polygon points="12,3 21,8 21,16 12,21 3,16 3,8" fill="none" stroke={T.titan300} strokeWidth="1.2"/><circle cx="12" cy="12" r="4" fill={T.titan400}/></svg>
        </div>
        <div style={{fontSize:38, fontWeight:900, color:'#fff', letterSpacing:'-0.02em', lineHeight:1.05}}>
          Runtime TelegramBot <span style={{color:T.titan400, fontWeight:400}}>Titan Edition</span>
        </div>
        <div style={{fontSize:16, color:'#a3a3a3', marginTop:10}}>© 2026 Simone Pizzi per Runtime Radio</div>
        <div style={{marginTop:32, padding:24, background:'rgba(16,16,26,0.5)', backdropFilter:'blur(10px)', border:'1px solid rgba(59,130,246,0.1)', borderRadius:18, textAlign:'left'}}>
          <div style={{fontSize:11, letterSpacing:'0.3em', fontWeight:700, color:T.titan400, textTransform:'uppercase', marginBottom:14, textAlign:'center'}}>Interface Language</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10}}>
            {flags.map(([code, name])=>{
              const sel = code==='IT';
              return (
                <div key={code} style={{padding:14, borderRadius:12, background: sel ? 'rgba(59,130,246,0.15)' : T.dark900, border: sel ? `2px solid ${T.titan500}` : '1px solid rgba(59,130,246,0.1)', textAlign:'center', cursor:'pointer', opacity: sel ? 1 : 0.75}}>
                  <div style={{display:'flex', justifyContent:'center'}}><FlagTile code={code}/></div>
                  <div style={{marginTop:6, fontSize:11, color:'#e0e7ff', fontWeight:600}}>{name}</div>
                </div>
              );
            })}
          </div>
        </div>
        <button style={{marginTop:26, padding:'12px 28px', borderRadius:999, background:T.titan500, color:T.dark950, border:'none', fontSize:14, fontWeight:700, display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer', boxShadow:'0 0 30px rgba(59,130,246,0.4)'}}>
          Launch Titan <I.ChevronRight size={18} stroke={T.dark950}/>
        </button>
      </div>
    </div>
  );
}

// ── 9.2 SetupWizard ────────────────────────────────────────
function SetupWizard() {
  return (
    <div style={{width:1280, height:800, background:T.dark950, ...gridDotsStyle, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif', color:'#e0e7ff', position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', left:'50%', top:'50%', width:500, height:500, transform:'translate(-50%,-50%)', background:'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)'}}/>
      <div style={{position:'relative', zIndex:1, width:460, textAlign:'center'}}>
        <div style={{fontSize:30, fontWeight:900, color:'#fff', letterSpacing:'-0.02em'}}>
          Runtime TelegramBot <span style={{color:T.titan400, fontWeight:400}}>Titan Edition</span>
        </div>
        <div style={{fontSize:12, letterSpacing:'0.25em', color:T.titan400, fontWeight:700, marginTop:10, textTransform:'uppercase'}}>Initialize your bot environment</div>
        <div style={{marginTop:28, background:'rgba(10,10,15,0.8)', backdropFilter:'blur(20px)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:18, overflow:'hidden', textAlign:'left'}}>
          {/* progress bar */}
          <div style={{height:3, background:T.dark950, position:'relative'}}>
            <div style={{height:'100%', width:'50%', background:`linear-gradient(to right, ${T.titan600}, ${T.titan400})`, boxShadow:`0 0 10px rgba(59,130,246,0.5)`}}/>
          </div>
          <div style={{padding:28}}>
            <div style={{fontSize:10, letterSpacing:'0.2em', color:'rgba(59,130,246,0.5)', fontWeight:700, marginBottom:3, textTransform:'uppercase'}}>Step 2 of 4</div>
            <div style={{fontSize:18, fontWeight:700, color:'#fff', marginBottom:18}}>2. Telegram Bot Token</div>
            <input readOnly defaultValue="123456:ABC-DefGhiJklm..." style={{...tinyInput, padding:'10px 12px', fontSize:12}}/>
            <div style={{fontSize:11, color:'#a3a3a3', marginTop:8, lineHeight:1.5}}>Get this from <span style={{color:T.titan400, fontFamily:'Fira Code, monospace'}}>@BotFather</span> on Telegram.</div>
            <button style={{marginTop:22, width:'100%', padding:'12px 16px', borderRadius:10, background:`linear-gradient(135deg, ${T.titan600}, ${T.titan500})`, border:'none', color:'#fff', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', boxShadow:'0 0 25px rgba(59,130,246,0.3)'}}>
              Next Step <I.ArrowRight size={16} stroke="#fff"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BotSettingsGeneral, BotSettingsTemplates, SystemSettings, StatsModal, ConfirmDialog, ToastStack, ErrorScreen, IntroScreen, SetupWizard });
