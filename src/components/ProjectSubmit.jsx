import { useState } from 'react'
import { Card, Field, PBtn, Divider, Badge, Spinner, inp } from './ui.jsx'
import { SECTORS, STAGES, MARKETS } from '../constants.js'
import { api } from '../hooks/useApi.js'

const EMPTY = {
  ownerName: '', projectName: '', sector: '', stage: '', targetMarket: '',
  problem: '', solution: '', market: '', businessModel: '', team: '', financials: '', askAmount: ''
}

export default function ProjectSubmit({ projects, onSubmit, deadline, maxProjects }) {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | saving | analyzing | done
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const ready = Object.values(form).every(v => v.trim() !== '')
  const expired = deadline && new Date() > new Date(deadline)
  const dl = deadline ? new Date(deadline) : null

  if (status === 'done') return (
    <Card title="✅ Projeto Enviado e Analisado!" subtitle={`"${form.projectName}" registrado com pré-avaliação da IA`}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🎯</div>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>
          Seu projeto está visível no placar com o score de referência da IA.<br />
          Aguarde a abertura da <strong>Fase 2 – Avaliação</strong>.
        </p>
        <div style={{ marginTop: 14, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13, color: '#166534' }}>
          {projects.length} projeto(s) submetido(s) · máx. {maxProjects}
        </div>
      </div>
    </Card>
  )

  if (status === 'analyzing') return (
    <Card title="🤖 Analisando seu projeto…" subtitle="A IA está gerando o score de referência">
      <Spinner label="Avaliação em andamento…" />
    </Card>
  )

  if (expired) return (
    <Card title="⏰ Prazo Encerrado">
      <div style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: 14 }}>O período de submissão foi encerrado.</div>
    </Card>
  )

  const handleSubmit = async () => {
    setStatus('saving')
    const proj = { ...form, id: `proj_${Date.now()}` }
    await onSubmit(proj)
    setStatus('analyzing')
    try {
      const aiResult = await api.runAIEval(proj)
      await onSubmit(proj, aiResult)
    } catch (e) { console.error('AI eval error:', e) }
    setStatus('done')
  }

  return (
    <Card title="📋 Submissão de Projeto"
      subtitle={dl ? `Prazo: ${dl.toLocaleString('pt-BR')}` : ''}
      badge={`${projects.length}/${maxProjects} enviados`}>
      <div style={{ marginBottom: 14, padding: '10px 14px', background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', fontSize: 12, color: '#0369a1' }}>
        🤖 Ao submeter, seu projeto será automaticamente pré-avaliado pela IA como score de referência.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <Field label="SEU NOME" required><input style={inp} placeholder="Nome completo" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} /></Field>
        <Field label="NOME DO PROJETO" required><input style={inp} placeholder="Ex.: MedFlow, AgroSense…" value={form.projectName} onChange={e => set('projectName', e.target.value)} /></Field>
        <Field label="SETOR" required>
          <select style={inp} value={form.sector} onChange={e => set('sector', e.target.value)}>
            <option value="">Selecione…</option>{SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="ESTÁGIO" required>
          <select style={inp} value={form.stage} onChange={e => set('stage', e.target.value)}>
            <option value="">Selecione…</option>{STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="MERCADO INICIAL" required>
          <select style={inp} value={form.targetMarket} onChange={e => set('targetMarket', e.target.value)}>
            <option value="">Selecione…</option>{MARKETS.map(m => <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="CAPTAÇÃO / VALOR SOLICITADO (USD)" required>
          <input style={inp} placeholder="Ex.: $ 500,000" value={form.askAmount} onChange={e => set('askAmount', e.target.value)} />
        </Field>
      </div>
      <Divider label="PITCH DESCRITIVO" />
      {[
        ['problem', 'PROBLEMA & OPORTUNIDADE', 'Qual dor resolve? Qual o tamanho do mercado? Evidências?'],
        ['solution', 'SOLUÇÃO & VIABILIDADE TÉCNICA', 'Como funciona? Diferenciais? Tecnologia disponível?'],
        ['market', 'MERCADO & FACILIDADE DE VENDA', 'Clientes atuais? Ciclo de venda? Validações?'],
        ['businessModel', 'MODELO DE NEGÓCIO & ESCALABILIDADE', 'Como gera receita? Como escala com baixo custo marginal?'],
        ['team', 'TIME & EXECUÇÃO', 'Fundadores, experiências relevantes e gaps conhecidos'],
        ['financials', 'FINANCEIRO: DESENVOLVIMENTO & ROI', 'Custo estimado (USD), tempo de MVP e premissas financeiras'],
      ].map(([k, lbl, ph]) => (
        <Field key={k} label={lbl} required>
          <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} placeholder={ph}
            value={form[k]} onChange={e => set(k, e.target.value)} />
        </Field>
      ))}
      <PBtn disabled={!ready || status === 'saving'} onClick={handleSubmit}>
        {status === 'saving' ? 'Salvando…' : 'Enviar projeto e obter pré-avaliação IA →'}
      </PBtn>
    </Card>
  )
}