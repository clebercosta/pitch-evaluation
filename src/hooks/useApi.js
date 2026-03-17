// Camada de acesso à API — substitui o window.storage do artefato
export const api = {
  // Config & phase
  async getSession() {
    const r = await fetch('/api/config')
    return r.json()
  },
  async saveConfig(config) {
    await fetch('/api/config', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ config }) })
  },
  async savePhase(phase) {
    await fetch('/api/config', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phase }) })
  },
  async reset() {
    await fetch('/api/config', { method:'DELETE' })
  },

  // Projects
  async getProjects() {
    const r = await fetch('/api/projects')
    return r.json()
  },
  async addProject(project) {
    await fetch('/api/projects', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(project) })
  },

  // Evaluations
  async getEvaluations() {
    const r = await fetch('/api/evaluations')
    return r.json()
  },
  async addEvaluation(evaluation) {
    await fetch('/api/evaluations', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(evaluation) })
  },

  // AI evaluations
  async getAIEvals() {
    const r = await fetch('/api/ai-evals')
    return r.json()
  },
  async runAIEval(project) {
    const r = await fetch('/api/ai-evaluate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(project) })
    return r.json()
  },
}
