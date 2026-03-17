import { useState } from 'react'
import { Card, Field, PBtn, inp } from './ui.jsx'

export default function AdminSetup({ onConfirm }) {
  const [cfg, setCfg] = useState({ deadline: '', evaluatorCount: 5, adminPin: '' })
  const ready = cfg.deadline && cfg.evaluatorCount >= 2 && cfg.adminPin.length >= 4

  return (
    <Card title="⚙️ Configuração da Sessão" subtitle="Defina os parâmetros antes de abrir as submissões">
      <Field label="PRAZO PARA SUBMISSÃO DOS PROJETOS" required>
        <input type="datetime-local" value={cfg.deadline}
          onChange={e => setCfg(p => ({ ...p, deadline: e.target.value }))} style={inp} />
      </Field>
      <Field label="NÚMERO DE AVALIADORES / PROJETOS" required>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="range" min={2} max={10} value={cfg.evaluatorCount}
            onChange={e => setCfg(p => ({ ...p, evaluatorCount: +e.target.value }))} style={{ flex: 1 }} />
          <span style={{ fontSize: 22, fontWeight: '800', color: '#6366f1', minWidth: 28, textAlign: 'center' }}>
            {cfg.evaluatorCount}
          </span>
        </div>
      </Field>
      <Field label="PIN DO FACILITADOR (mín. 4 dígitos)" required>
        <input type="password" maxLength={8} value={cfg.adminPin}
          onChange={e => setCfg(p => ({ ...p, adminPin: e.target.value.replace(/\D/g, '') }))}
          placeholder="Ex.: 1234" style={inp} />
      </Field>
      <div style={{ marginTop: 12, padding: '12px 14px', background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', fontSize: 12, color: '#0369a1' }}>
        🤖 Cada projeto será avaliado automaticamente pela IA assim que submetido.
      </div>
      <PBtn disabled={!ready} onClick={() => onConfirm(cfg)}>
        Salvar configuração e abrir submissões →
      </PBtn>
    </Card>
  )
}