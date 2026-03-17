import { useState } from 'react'
import { Badge } from './ui.jsx'
import { CATEGORIES, calcCat, calcTotal, getColor, TOTAL_Q } from '../constants.js'

export default function Results({ projects, evaluations, aiEvals, onRefresh, loading }) {
  const [detail, setDetail] = useState(null)

  const results = projects.map(proj => {
    const humanEvs = evaluations.filter(e => e.scores[proj.id])
    const aiEv = aiEvals?.[proj.id]
    const allEvs = [...humanEvs, ...(aiEv ? [{ name: '🤖 IA (referência)', scores: aiEv.scores, notes: aiEv.notes, isAI: true }] : [])]
    const humanAvg = humanEvs.length ? humanEvs.reduce((a, e) => a + calcTotal(e.scores[proj.id] || {}), 0) / humanEvs.length : 0
    const aiScore = aiEv ? calcTotal(aiEv.scores) : null
    const cats = CATEGORIES.map(cat => ({
      ...cat,
      humanAvg: humanEvs.length ? humanEvs.reduce((a, e) => a + calcCat(e.scores[proj.id] || {}, cat.id), 0) / humanEvs.length : 0,
      aiAvg: aiEv ? calcCat(aiEv.scores, cat.id) : null,
    }))
    return { ...proj, humanAvg, aiScore, cats, humanEvs, allEvs }
  }).sort((a, b) => b.humanAvg - a.humanAvg)

  const overallHuman = results.filter(r => r.humanAvg > 0).reduce((a, p) => a + p.humanAvg, 0) / (results.filter(r => r.humanAvg > 0).length || 1)

  return (
    <div>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', borderRadius: 14, padding: '20px 24px', marginBottom: 18, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'monospace' }}>Resultado Final do Painel</div>
            <div style={{ display: 'flex', gap: 28, marginTop: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 48, fontWeight: '800', color: getColor(overallHuman), lineHeight: 1 }}>{overallHuman > 0 ? overallHuman.toFixed(2) : '—'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>média humana</div>
              </div>
              {[['Projetos', projects.length], ['Avaliadores', evaluations.length], ['Critérios', TOTAL_Q]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 1 }}>{v}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{l}</div></div>
              ))}
            </div>
          </div>
          <button onClick={onRefresh} disabled={loading} style={{ padding: '7px 14px', borderRadius: 20, background: '#ffffff15', border: '1px solid #ffffff30', color: '#cbd5e1', fontSize: 12, cursor: 'pointer' }}>
            {loading ? '⏳' : '🔄'} Atualizar
          </button>
        </div>
        {evaluations.length > 0 && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#ffffff10', borderRadius: 8, fontSize: 12, color: '#94a3b8' }}>
            Concluídos: {evaluations.map(e => <span key={e.id} style={{ marginRight: 8, color: '#22c55e' }}>✓ {e.name}</span>)}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: '600', color: '#64748b' }}>Nenhuma avaliação concluída ainda</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Clique em "Atualizar" para verificar novos dados</div>
        </div>
      ) : results.map((proj, i) => (
        <div key={proj.id} style={{ background: '#fff', borderRadius: 12, marginBottom: 12, border: i === 0 ? '2px solid #6366f1' : '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 26 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: '800', color: '#1e293b' }}>{proj.projectName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>por {proj.ownerName} · {proj.sector} · {proj.stage}</div>
                <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                  <Badge color="#0ea5e9" bg="#f0f9ff">{proj.targetMarket}</Badge>
                  <Badge color="#22c55e" bg="#f0fdf4">{proj.askAmount}</Badge>
                  {proj.aiScore !== null && <Badge color="#0369a1" bg="#f0f9ff">🤖 IA: {proj.aiScore.toFixed(2)}</Badge>}
                </div>
                <div style={{ marginTop: 10 }}>
                  {proj.cats.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: '#94a3b8', width: 200, flexShrink: 0 }}>{cat.icon} {cat.label}</span>
                      <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 5, position: 'relative' }}>
                        <div style={{ width: `${(cat.humanAvg / 5) * 100}%`, height: 5, borderRadius: 4, background: getColor(cat.humanAvg), transition: 'width 0.5s' }} />
                        {cat.aiAvg !== null && <div style={{ position: 'absolute', top: 0, left: `${(cat.aiAvg / 5) * 100}%`, transform: 'translateX(-50%)', width: 2, height: 5, background: '#0ea5e9', borderRadius: 2 }} />}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: '700', color: getColor(cat.humanAvg), width: 28 }}>{cat.humanAvg > 0 ? cat.humanAvg.toFixed(1) : '—'}</span>
                      {cat.aiAvg !== null && <span style={{ fontSize: 10, color: '#0ea5e9', width: 24 }}>🤖{cat.aiAvg.toFixed(1)}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 38, fontWeight: '800', color: getColor(proj.humanAvg), lineHeight: 1 }}>{proj.humanAvg > 0 ? proj.humanAvg.toFixed(2) : '—'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{proj.humanEvs.length} avaliador(es)</div>
                {proj.aiScore !== null && proj.humanAvg > 0 && (
                  <div style={{ fontSize: 11, color: Math.abs(proj.aiScore - proj.humanAvg) < 0.5 ? '#22c55e' : '#f97316', marginBottom: 6 }}>
                    Δ IA {proj.aiScore > proj.humanAvg ? '↑' : '↓'}{Math.abs(proj.aiScore - proj.humanAvg).toFixed(2)}
                  </div>
                )}
                <button onClick={() => setDetail(detail === proj.id ? null : proj.id)}
                  style={{ padding: '4px 12px', borderRadius: 14, border: '1.5px solid #6366f1', background: 'transparent', color: '#6366f1', fontSize: 11, fontWeight: '700', cursor: 'pointer' }}>
                  {detail === proj.id ? '▲ Fechar' : '▼ Detalhes'}
                </button>
              </div>
            </div>
            <div style={{ marginTop: 10, padding: '9px 13px', borderRadius: 8, background: proj.humanAvg >= 4 ? '#f0fdf4' : proj.humanAvg >= 3 ? '#fefce8' : proj.humanAvg > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${proj.humanAvg > 0 ? getColor(proj.humanAvg) + '25' : '#e2e8f0'}`, fontSize: 12, color: '#334155' }}>
              {proj.humanAvg === 0 && '⏳ Aguardando avaliações humanas — score de referência da IA disponível.'}
              {proj.humanAvg >= 4.5 && '🟣 Excepcional — Avançar para due diligence imediatamente.'}
              {proj.humanAvg >= 3.5 && proj.humanAvg < 4.5 && '🟢 Sólido — Solicitar aprofundamento nos critérios abaixo de 3.5.'}
              {proj.humanAvg >= 2.5 && proj.humanAvg < 3.5 && '🟡 Mediano — Requer amadurecimento estrutural em dimensões críticas.'}
              {proj.humanAvg > 0 && proj.humanAvg < 2.5 && '🔴 Abaixo do limiar — Revisão profunda necessária antes de nova apresentação.'}
            </div>
          </div>

          {detail === proj.id && (
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', background: '#fafafa' }}>
              <div style={{ fontSize: 13, fontWeight: '800', color: '#1e293b', marginBottom: 12 }}>📝 Análise Qualitativa</div>
              {proj.allEvs.map((ev, ei) => {
                const n = ev.isAI ? ev.notes : (ev.notes[proj.id] || {})
                const sc = ev.isAI ? calcTotal(ev.scores) : calcTotal(ev.scores[proj.id] || {})
                const hasNotes = n && [n.pros, n.cons, n.objections, n.general].some(v => v)
                return (
                  <div key={ei} style={{ marginBottom: 10, padding: '12px 14px', background: ev.isAI ? '#f0f9ff' : '#fff', borderRadius: 10, border: `1px solid ${ev.isAI ? '#bae6fd' : '#e2e8f0'}` }}>
                    <div style={{ fontSize: 12, fontWeight: '700', color: ev.isAI ? '#0369a1' : '#6366f1', marginBottom: hasNotes ? 10 : 0 }}>
                      {ev.name} — <span style={{ color: getColor(sc) }}>{sc.toFixed(2)}</span>
                    </div>
                    {ev.isAI && (n.highlights?.length > 0 || n.lowlights?.length > 0) && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        {n.highlights?.length > 0 && (
                          <div style={{ background: '#f0fdf4', borderRadius: 7, padding: '10px 12px', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: 11, fontWeight: '700', color: '#166534', marginBottom: 6 }}>⭐ HIGH LIGHTS</div>
                            {n.highlights.map((h, hi) => (
                              <div key={hi} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                                <span style={{ color: '#22c55e', flexShrink: 0 }}>▲</span>
                                <span style={{ fontSize: 12, color: '#166534', lineHeight: 1.5 }}>{h}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {n.lowlights?.length > 0 && (
                          <div style={{ background: '#fef2f2', borderRadius: 7, padding: '10px 12px', border: '1px solid #fecaca' }}>
                            <div style={{ fontSize: 11, fontWeight: '700', color: '#991b1b', marginBottom: 6 }}>⚠️ LOW LIGHTS</div>
                            {n.lowlights.map((l, li) => (
                              <div key={li} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                                <span style={{ color: '#ef4444', flexShrink: 0 }}>▼</span>
                                <span style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.5 }}>{l}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {hasNotes ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[['✅ Prós', n.pros], ['❌ Contras', n.cons], ['⚠️ Objeções', n.objections], ['💬 Observações', n.general]].filter(([, v]) => v).map(([lbl, val]) => (
                          <div key={lbl} style={{ background: ev.isAI ? '#fff' : '#f8fafc', borderRadius: 7, padding: '9px 11px' }}>
                            <div style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 3 }}>{lbl}</div>
                            <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, fontStyle: 'italic' }}>"{val}"</div>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma observação registrada.</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}