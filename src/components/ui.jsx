export const inp = {
  width:"100%", padding:"10px 12px", border:"1.5px solid #e2e8f0",
  borderRadius:8, fontSize:13, color:"#334155", fontFamily:"inherit",
  boxSizing:"border-box", outline:"none", background:"#fff"
}

export function Badge({ children, color="#6366f1", bg="#eef2ff" }) {
  return <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:bg,color,fontWeight:"700",border:`1px solid ${color}30`}}>{children}</span>
}

export function PBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", marginTop:16, padding:14, borderRadius:10, border:"none",
      background: disabled ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#4f46e5)",
      color: disabled ? "#94a3b8" : "#fff",
      fontSize:14, fontWeight:"700", cursor: disabled ? "not-allowed" : "pointer", transition:"all 0.2s"
    }}>{children}</button>
  )
}

export function ScoreBtn({ value, selected, onSelect, scaleItem }) {
  return (
    <button onClick={() => onSelect(value)} style={{
      width:36, height:36, borderRadius:"50%",
      border: selected ? `3px solid ${scaleItem.color}` : "2px solid #e2e8f0",
      background: selected ? scaleItem.bg : "#fff",
      color: selected ? scaleItem.color : "#94a3b8",
      fontWeight: selected ? "700" : "500", fontSize:14, cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s"
    }}>{value}</button>
  )
}

export function Field({ label, required, children }) {
  return (
    <div style={{marginBottom:13}}>
      <label style={{display:"block",fontSize:12,fontWeight:"700",color:"#475569",marginBottom:5,letterSpacing:0.3}}>
        {label}{required && <span style={{color:"#ef4444"}}> *</span>}
      </label>
      {children}
    </div>
  )
}

export function Divider({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0 12px"}}>
      <div style={{flex:1,height:1,background:"#e2e8f0"}}/>
      <span style={{fontSize:11,color:"#94a3b8",fontWeight:"700",letterSpacing:2,fontFamily:"monospace"}}>{label}</span>
      <div style={{flex:1,height:1,background:"#e2e8f0"}}/>
    </div>
  )
}

export function Card({ title, subtitle, badge, children }) {
  return (
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e2e8f0",padding:"22px 24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:17,fontWeight:"800",color:"#1e293b"}}>{title}</div>
          {subtitle && <div style={{fontSize:12,color:"#94a3b8",marginTop:3}}>{subtitle}</div>}
        </div>
        {badge && <Badge>{badge}</Badge>}
      </div>
      {children}
    </div>
  )
}

export function Spinner({ label = "Carregando…" }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,gap:12,color:"#94a3b8",fontSize:14}}>
      <div style={{width:20,height:20,border:"2px solid #e2e8f0",borderTop:"2px solid #6366f1",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      {label}
    </div>
  )
}
