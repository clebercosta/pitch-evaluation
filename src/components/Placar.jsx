import { calcTotal, calcCat, countAnswered, getColor, CATEGORIES, TOTAL_Q } from '../constants.js'

export default function Placar({ phase, projects, evaluations, aiEvals, maxProjects, onRefresh, loading }) {
  const submittedPct = maxProjects ? Math.round((projects.length / maxProjects) * 100) : 0

  return (
    <div style={{ width: 220, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', borderRadius: 12, padding: '14px 16px', color: '#fff' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 8 }}>📊 Placar</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Projetos</span>
            <span style={{ fontSize: 18, fontWeight: '800', color: projects.length >= maxProjects ? '#22c55e' : '#fbbf24' }}>
              {projects.length}<span style={{ fontSize: 12, color: '#94a3b8' }}>/{maxProjects}</span>
            </span>
          </div>
          <div style={{ background: '#334155', borderRadius: 4, height: 5, marginTop: 4 }}>
            <div style={{ width: `${submittedPct}%`, height: 5, borderRadius: 4, background: projects.length >= maxProjects ? '#22c55e' : '#fbbf24', transition: 'width 0.4s' }} />
          </div>
          {phase === 'evaluate' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Avaliações</span>
              <span style={{ fontSize: 18, fontWeight: '800', color: '#6366f1' }}>{evaluations.length}</span>
            </div>
          )}
        </div>

        {/* Projects list */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: '700', color: '#475569', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase', fontFamily: 'monospace' }}>📋 Projetos Enviados</div>
          {projects.length === 0 ? (
            <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Nenhum ainda…</div>
          ) : projects.map((p, i) => {
            const ai = aiEvals?.[p.id]
            const aiScore = ai ? calcTotal(ai.scores) : null
            return (
              <div key={p.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < projects.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0fdf4', border: '1.5px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✓</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.projectName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.ownerName}</div>
                  </div>
                </div>
                {aiScore !== null ? (
                  <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10 }}>🤖</span>
                    <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 4 }}>
                      <div style={{ width: `${(aiScore / 5) * 100}%`, height: 4, borderRadius: 4, background: getColor(aiScore) }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: '700', color: getColor(aiScore) }}>{aiScore.toFixed(1)}</span>
                  </div>
                ) : (
                  <div style={{ marginTop: 5, fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>🤖 Analisando…</div>
                )}
              </div>
            )
          })}
          {Array.from({ length: Math.max(0, maxProjects - projects.length) }).map((_, i) => (
            <div key={`e${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f8fafc', border: '1.5px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#cbd5e1', flexShrink: 0 }}>?</div>
              <div style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic' }}>Aguardando…</div>
            </div>
          ))}
        </div>

        {/* Evaluators */}
        {phase === 'evaluate' && evaluations.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: '700', color: '#475569', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase', fontFamily: 'monospace' }}>🔍 Avaliadores Concluídos</div>
            {evaluations.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eef2ff', border: '1.5px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✓</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: '700', color: '#1e293b' }}>{ev.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{projects.filter(p => countAnswered(ev.scores[p.id] || {}) === TOTAL_Q).length}/{projects.length} projetos</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onRefresh} disabled={loading} style={{ padding: '9px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#6366f1', fontSize: 12, fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {loading ? '⏳' : '🔄'} Atualizar placar
        </button>
      </div>
    </div>
  )
}