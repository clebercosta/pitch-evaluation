import { useState } from 'react'
import { inp } from './ui.jsx'

export default function FacilitatorPanel({ phase, setPhase, projects, evaluations, config, onReset }) {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [show, setShow] = useState(false)
  const [resetStep, setResetStep] = useState(0)
  const [resetPin, setResetPin] = useState('')

  const hasData = projects.length > 0 || evaluations.length > 0

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), config, projects, evaluations }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pitch-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!show) return (
    <button onClick={() => setShow(true)} style={{ position: 'fixed', bottom: 20, right: 20, padding: '8px 16px', borderRadius: 20, background: '#1e293b', color: '#fff', border: 'none', fontSize: 12, fontWeight: '700', cursor: 'pointer', zIndex: 999 }}>
      🔑 Facilitador
    </button>
  )

  if (!unlocked) return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#fff', borderRadius: 14, border: '1.5px solid #6366f1', padding: '16px 18px', boxShadow: '0 8px 32px #0002', zIndex: 999, width: 220 }}>
      <div style={{ fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 8 }}>🔑 Painel do Facilitador</div>
      <input type="password" value={pin} onChange={e => setPin(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (pin === config?.adminPin ? setUnlocked(true) : alert('PIN incorreto'))}
        placeholder="PIN" style={{ ...inp, marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => { if (pin === config?.adminPin) setUnlocked(true); else alert('PIN incorreto') }}
          style={{ flex: 1, padding: 8, borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', fontWeight: '700', fontSize: 12, cursor: 'pointer' }}>Entrar</button>
        <button onClick={() => setShow(false)}
          style={{ padding: 8, borderRadius: 8, background: '#f1f5f9', color: '#475569', border: 'none', fontSize: 12, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  )

  if (resetStep === 1) return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#fff', borderRadius: 14, border: '2px solid #ef4444', padding: '16px 18px', boxShadow: '0 8px 32px #0002', zIndex: 999, width: 260 }}>
      <div style={{ fontSize: 13, fontWeight: '800', color: '#ef4444', marginBottom: 6 }}>⚠️ Confirmar Reset</div>
      <div style={{ fontSize: 12, color: '#475569', marginBottom: 12, lineHeight: 1.6 }}>
        <strong>{projects.length} projeto(s)</strong> e <strong>{evaluations.length} avaliação(ões)</strong> serão apagados. Digite o PIN:
      </div>
      <input type="password" value={resetPin} onChange={e => setResetPin(e.target.value)} placeholder="PIN do facilitador" style={{ ...inp, marginBottom: 10, borderColor: '#ef4444' }} />
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => { if (resetPin === config?.adminPin) setResetStep(2); else alert('PIN incorreto'); setResetPin('') }}
          style={{ flex: 1, padding: 8, borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', fontWeight: '700', fontSize: 12, cursor: 'pointer' }}>Confirmar</button>
        <button onClick={() => setResetStep(0)}
          style={{ padding: 8, borderRadius: 8, background: '#f1f5f9', color: '#475569', border: 'none', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )

  if (resetStep === 2) return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#fff', borderRadius: 14, border: '2px solid #ef4444', padding: '16px 18px', boxShadow: '0 8px 32px #0002', zIndex: 999, width: 260 }}>
      <div style={{ fontSize: 13, fontWeight: '800', color: '#ef4444', marginBottom: 8 }}>🚨 Última confirmação</div>
      <div style={{ fontSize: 12, color: '#475569', marginBottom: 14, lineHeight: 1.6 }}>Esta ação é <strong>permanente e irreversível</strong>.</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={async () => { await onReset(); setResetStep(0); setUnlocked(false); setShow(false) }}
          style={{ flex: 1, padding: 8, borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', fontWeight: '700', fontSize: 12, cursor: 'pointer' }}>Sim, apagar tudo</button>
        <button onClick={() => setResetStep(0)}
          style={{ padding: 8, borderRadius: 8, background: '#f1f5f9', color: '#475569', border: 'none', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#fff', borderRadius: 14, border: '1.5px solid #6366f1', padding: '16px 18px', boxShadow: '0 8px 32px #0002', zIndex: 999, width: 250 }}>
      <div style={{ fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 4 }}>🔑 Facilitador</div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{projects.length} projetos · {evaluations.length} avaliações</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['submit', 'evaluate', 'results'].map(p => (
          <button key={p} onClick={() => setPhase(p)} style={{ padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${phase === p ? '#6366f1' : '#e2e8f0'}`, background: phase === p ? '#eef2ff' : '#f8fafc', color: phase === p ? '#6366f1' : '#475569', fontSize: 12, fontWeight: '700', cursor: 'pointer', textAlign: 'left' }}>
            {p === 'submit' ? '📋 Abrir Submissões' : p === 'evaluate' ? '🔍 Abrir Avaliações' : '🏆 Ver Resultados'}
          </button>
        ))}
        <button onClick={handleExport} style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #22c55e', background: '#f0fdf4', color: '#166534', fontSize: 12, fontWeight: '700', cursor: 'pointer', marginTop: 4 }}>
          💾 Exportar backup JSON
        </button>
        {hasData ? (
          <button onClick={() => setResetStep(1)} style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontSize: 12, fontWeight: '700', cursor: 'pointer' }}>
            🗑️ Resetar <span style={{ fontSize: 10 }}>(confirmação dupla)</span>
          </button>
        ) : (
          <button onClick={onReset} style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', fontSize: 12, fontWeight: '700', cursor: 'pointer' }}>
            🗑️ Resetar sessão
          </button>
        )}
      </div>
      <button onClick={() => setUnlocked(false)} style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Sair do painel</button>
    </div>
  )
}