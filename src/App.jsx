import { useState, useEffect, useCallback } from 'react'
import { api } from './hooks/useApi.js'
import { Spinner } from './components/ui.jsx'
import AdminSetup from './components/AdminSetup.jsx'
import ProjectSubmit from './components/ProjectSubmit.jsx'
import EvaluationPhase from './components/EvaluationPhase.jsx'
import Results from './components/Results.jsx'
import Placar from './components/Placar.jsx'
import FacilitatorPanel from './components/FacilitatorPanel.jsx'

const PHASES = [
  { id: 'setup',    label: 'Configuração', icon: '⚙️' },
  { id: 'submit',   label: 'Submissão',    icon: '📋' },
  { id: 'evaluate', label: 'Avaliação',    icon: '🔍' },
  { id: 'results',  label: 'Resultados',   icon: '🏆' },
]

export default function App() {
  const [loading,     setLoading]     = useState(true)
  const [config,      setConfig]      = useState(null)
  const [phase,       setPhaseState]  = useState('setup')
  const [projects,    setProjects]    = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [aiEvals,     setAIEvals]     = useState({})

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [session, projs, evals, aiE] = await Promise.all([
        api.getSession(),
        api.getProjects(),
        api.getEvaluations(),
        api.getAIEvals(),
      ])
      setConfig(session.config)
      setPhaseState(session.phase || 'setup')
      setProjects(projs || [])
      setEvaluations(evals || [])
      setAIEvals(aiE || {})
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const savePhase = async (p) => {
    setPhaseState(p)
    await api.savePhase(p)
  }

  const handleConfig = async (cfg) => {
    setConfig(cfg)
    await api.saveConfig(cfg)
    await savePhase('submit')
  }

  const handleProject = async (proj, aiResult = null) => {
    if (!aiResult) {
      await api.addProject(proj)
      setProjects(prev => [...prev, proj])
    } else {
      await api.addAIEval(proj.id, aiResult)
      setAIEvals(prev => ({ ...prev, [proj.id]: aiResult }))
    }
  }

  const handleEval = async (ev) => {
    await api.addEvaluation(ev)
    setEvaluations(prev => [...prev, ev])
  }

  const handleReset = async () => {
    await api.reset()
    setConfig(null)
    setPhaseState('setup')
    setProjects([])
    setEvaluations([])
    setAIEvals({})
  }

  const pi = PHASES.findIndex(p => p.id === phase)
  const showPlacar = phase === 'submit' || phase === 'evaluate'

  if (loading) return (
    <div style={{ fontFamily: "'Georgia',serif", background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner label="Carregando sessão…" />
    </div>
  )

  return (
    <div style={{ fontFamily: "'Georgia',serif", background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', color: '#fff', padding: '22px 26px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ fontSize: 24 }}>🏗️</div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'monospace' }}>MÉTODO DE AVALIAÇÃO</div>
              <div style={{ fontSize: 19, fontWeight: '700' }}>
                Pitch Evaluation Framework{' '}
                <span style={{ fontSize: 12, color: '#6366f1', fontFamily: 'monospace' }}>v5 · Vercel</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>dados persistentes</span>
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            {PHASES.map((p, i) => {
              const active = p.id === phase
              const done = i < pi
              return (
                <button key={p.id} onClick={() => { if (done || active) savePhase(p.id) }}
                  style={{ padding: '8px 16px', background: active ? '#fff' : 'transparent', color: active ? '#1e293b' : done ? '#94a3b8' : '#475569', border: 'none', borderRadius: '8px 8px 0 0', fontWeight: active ? '700' : '500', fontSize: 12, cursor: done || active ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {done ? '✓' : p.icon} {p.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '22px 16px' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {phase === 'setup'    && <AdminSetup onConfirm={handleConfig} />}
            {phase === 'submit'   && config && <ProjectSubmit projects={projects} onSubmit={handleProject} deadline={config.deadline} maxProjects={config.evaluatorCount} />}
            {phase === 'evaluate' && config && <EvaluationPhase projects={projects} aiEvals={aiEvals} onFinish={handleEval} />}
            {phase === 'results'  && <Results projects={projects} evaluations={evaluations} aiEvals={aiEvals} onRefresh={loadAll} loading={loading} />}
          </div>
          {showPlacar && (
            <Placar phase={phase} projects={projects} evaluations={evaluations} aiEvals={aiEvals}
              maxProjects={config?.evaluatorCount || 5} onRefresh={loadAll} loading={loading} />
          )}
        </div>
      </div>

      {config && phase !== 'setup' && (
        <FacilitatorPanel phase={phase} setPhase={savePhase} projects={projects}
          evaluations={evaluations} config={config} onReset={handleReset} />
      )}
    </div>
  )
}