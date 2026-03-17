import { useState } from 'react'
import { Card, Field, PBtn, Badge, ScoreBtn, inp } from './ui.jsx'
import { CATEGORIES, SCALE, TOTAL_Q, calcCat, calcTotal, countAnswered, getColor } from '../constants.js'

export default function EvaluationPhase({ projects, aiEvals, onFinish }) {
  const [name, setName] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [idx, setIdx] = useState(0)
  const [scores, setScores] = useState({})
  const [notes, setNotes] = useState({})
  const [openCat, setOpenCat] = useState(CATEGORIES[0].id)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  const pid = projects[idx]?.id
  const ps = scores[pid] || {}
  const pn = notes[pid] || { pros: '', cons: '', objections: '', general: '' }
  const ans = countAnswered(ps)
  const pct = Math.round((ans / TOTAL_Q) * 100)

  const setScore = (qId, val) => setScores(p => ({ ...p, [pid]: { ...p[pid], [qId]: val } }))
  const setNote = (k, v) => setNotes(p => ({ ...p, [pid]: { ...pn, [k]: v } }))

  const handleNext = async () => {
    if (idx < projects.length - 1) { setIdx(i => i + 1); setOpenCat(CATEGORIES[0].id) }
    else {
      setSaving(true)
      await onFinish({ id: `eval_${Date.now()}`, name, scores, notes, finishedAt: new Date().toISOString() })
      setSaving(false)
      setDone(true)
    }
  }

  if (!confirmed) return (
    <Card title="👤 Identificação do Avaliador" subtitle="Seu nome será vinculado às suas avaliações">
      <Field label="SEU NOME">
        <input style={inp} placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} />
      </Field>
      <div style={{ marginTop: 12, padding: '10px 14px', background: '#fefce8', borderRadius: 8, border: '1px solid #fde047', fontSize: 12, color: '#713f12' }}>
        ⚠️ Você avaliará <strong>{projects.length} projeto(s)</strong> · {TOTAL_Q} critérios cada · ~{projects.length * 8} min.
      </div>
      <PBtn disabled={!name.trim()} onClick={() => setConfirmed(true)}>Iniciar avaliação →</PBtn>
    </Card>
  )

  if (done) return (
    <Card title="✅ Avaliação Concluída e Salva!">
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 52 }}>🏆</div>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 10, lineHeight: 1.7 }}>
          Suas notas foram <strong>salvas e sincronizadas</strong>.
        </p>
      </div>
    </Card>
  )

  const proj = projects[idx]
  const aiRef = aiEvals?.[proj.id]
  const aiRefScore = aiRef ? calcTotal(aiRef.scores) : null

  return (
    <div>
      {/* Project tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {projects.map((p, i) => {
          const d = countAnswered(scores[p.id] || {}) === TOTAL_Q
          return (
            <button key={p.id} onClick={() => { setIdx(i); setOpenCat(CATEGORIES[0].id) }}
              style={{ padding: '6px 14px', borderRadius: 20, border: `2px solid ${i === idx ? '#6366f1' : '#e2e8f0'}`, background: i === idx ? '#eef2ff' : '#f8fafc', color: i === idx ? '#6366f1' : '#475569', fontSize: 12, fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              {d && <span style={{ color: '#22c55e' }}>✓</span>}{p.projectName}
            </button>
          )
        })}
      </div>

      {/* AI reference banner */}
      {aiRefScore !== null && (
        <div style={{ background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd', padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 18 }}>🤖</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: '700', color: '#0369a1' }}>Score de referência da IA: <span style={{ fontSize: 16, color: getColor(aiRefScore) }}>{aiRefScore.toFixed(2)}</span></div>
            <div style={{ fontSize: 11, color: '#0369a1', opacity: 0.8 }}>Use como calibração — sua avaliação é independente</div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => { const s = calcCat(aiRef.scores, cat.id); return <span key={cat.id} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: '#fff', border: '1px solid #bae6fd', color: getColor(s), fontWeight: '700' }}>{cat.icon}{s.toFixed(1)}</span> })}
          </div>
        </div>
      )}

      {/* Project brief */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #6366f1', padding: '14px 18px', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: '800', color: '#1e293b' }}>{proj.projectName}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>por {proj.ownerName}</div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <Badge>{proj.sector}</Badge>
            <Badge color="#f97316" bg="#fff7ed">{proj.stage}</Badge>
            <Badge color="#0ea5e9" bg="#f0f9ff">{proj.targetMarket}</Badge>
            <Badge color="#22c55e" bg="#f0fdf4">{proj.askAmount}</Badge>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
          {[['🎯', proj.problem], ['💡', proj.solution], ['📈', proj.market], ['💰', proj.businessModel], ['👥', proj.team], ['📊', proj.financials]].map(([icon, txt]) => (
            <div key={icon} style={{ background: '#f8fafc', borderRadius: 7, padding: '8px 10px', fontSize: 12, color: '#334155', lineHeight: 1.5 }}><span style={{ marginRight: 4 }}>{icon}</span>{txt}</div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
          <span>{ans}/{TOTAL_Q} critérios · {pct}%</span>
          {calcTotal(ps) > 0 && <span style={{ color: getColor(calcTotal(ps)), fontWeight: '700' }}>Score parcial: {calcTotal(ps).toFixed(2)}</span>}
        </div>
        <div style={{ background: '#e2e8f0', borderRadius: 8, height: 6 }}>
          <div style={{ width: `${pct}%`, height: 6, borderRadius: 8, background: 'linear-gradient(90deg,#6366f1,#22c55e)', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Categories */}
      {CATEGORIES.map(cat => {
        const cs = calcCat(ps, cat.id)
        const open = openCat === cat.id
        const ca = cat.questions.filter(q => ps[q.id] > 0).length
        const aiCatScore = aiRef ? calcCat(aiRef.scores, cat.id) : null
        return (
          <div key={cat.id} style={{ background: '#fff', borderRadius: 12, marginBottom: 8, border: `1.5px solid ${open ? '#6366f1' : '#e2e8f0'}`, overflow: 'hidden' }}>
            <button onClick={() => setOpenCat(open ? null : cat.id)} style={{ width: '100%', padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>{cat.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{cat.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 17, fontWeight: '800', color: cs > 0 ? getColor(cs) : '#cbd5e1' }}>{cs > 0 ? cs.toFixed(1) : '—'}</div>
                {aiCatScore !== null && <div style={{ fontSize: 10, color: '#0ea5e9' }}>🤖 {aiCatScore.toFixed(1)}</div>}
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{ca}/{cat.questions.length} · {Math.round(cat.weight * 100)}%</div>
              </div>
              <span style={{ color: '#94a3b8', fontSize: 14, marginLeft: 6 }}>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 16px 16px' }}>
                {cat.questions.map((q, qi) => (
                  <div key={q.id} style={{ marginBottom: qi < cat.questions.length - 1 ? 16 : 0 }}>
                    <div style={{ fontSize: 13, color: '#334155', marginBottom: 7, lineHeight: 1.5, display: 'flex', gap: 8 }}>
                      <span style={{ minWidth: 20, height: 20, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: '700', color: '#64748b', flexShrink: 0 }}>{qi + 1}</span>
                      {q.text}
                    </div>
                    <div style={{ display: 'flex', gap: 7, alignItems: 'center', paddingLeft: 28 }}>
                      {[1, 2, 3, 4, 5].map(v => <ScoreBtn key={v} value={v} selected={ps[q.id] === v} onSelect={val => setScore(q.id, val)} scaleItem={SCALE.find(s => s.value === v)} />)}
                      {ps[q.id] && <span style={{ fontSize: 11, color: SCALE.find(s => s.value === ps[q.id])?.color, fontWeight: '600', marginLeft: 8 }}>{SCALE.find(s => s.value === ps[q.id])?.label}</span>}
                      {aiRef?.scores[q.id] && <span style={{ fontSize: 10, color: '#0ea5e9', marginLeft: 4 }}>🤖{aiRef.scores[q.id]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Qualitative notes */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', marginTop: 10 }}>
        <div style={{ fontSize: 13, fontWeight: '800', color: '#1e293b', marginBottom: 12 }}>📝 Análise Qualitativa</div>
        {aiRef?.notes && (
          <div style={{ marginBottom: 14, padding: '12px 14px', background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', fontSize: 12, color: '#0369a1' }}>
            <div style={{ fontWeight: '700', marginBottom: 10, fontSize: 13 }}>🤖 Análise da IA (referência)</div>
            {(aiRef.notes.highlights?.length > 0 || aiRef.notes.lowlights?.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {aiRef.notes.highlights?.length > 0 && (
                  <div style={{ background: '#f0fdf4', borderRadius: 7, padding: '10px 12px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 11, fontWeight: '700', color: '#166534', marginBottom: 6 }}>⭐ HIGH LIGHTS</div>
                    {aiRef.notes.highlights.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>▲</span>
                        <span style={{ fontSize: 12, color: '#166534', lineHeight: 1.5 }}>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
                {aiRef.notes.lowlights?.length > 0 && (
                  <div style={{ background: '#fef2f2', borderRadius: 7, padding: '10px 12px', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: 11, fontWeight: '700', color: '#991b1b', marginBottom: 6 }}>⚠️ LOW LIGHTS</div>
                    {aiRef.notes.lowlights.map((l, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                        <span style={{ color: '#ef4444', flexShrink: 0 }}>▼</span>
                        <span style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.5 }}>{l}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div><strong>Prós:</strong> {aiRef.notes.pros}</div>
            <div style={{ marginTop: 4 }}><strong>Contras:</strong> {aiRef.notes.cons}</div>
            <div style={{ marginTop: 4 }}><strong>Objeções:</strong> {aiRef.notes.objections}</div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['pros', '✅ Prós', 'Pontos fortes…'], ['cons', '❌ Contras', 'Fraquezas ou riscos…'], ['objections', '⚠️ Objeções', 'Barreiras a endereçar…'], ['general', '💬 Observações', 'Recomendações livres…']].map(([k, lbl, ph]) => (
            <div key={k}>
              <div style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 4 }}>{lbl}</div>
              <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder={ph} value={pn[k]} onChange={e => setNote(k, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <PBtn disabled={ans < TOTAL_Q || saving} onClick={handleNext}>
        {saving ? 'Salvando…' : ans < TOTAL_Q ? `Preencha todos os critérios (${TOTAL_Q - ans} restantes)` : idx < projects.length - 1 ? '✓ Confirmar e avaliar próximo →' : '✓ Concluir e salvar avaliação'}
      </PBtn>
    </div>
  )
}