const { Redis } = require('@upstash/redis')

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const project = req.body
  if (!project?.id) return res.status(400).json({ error: 'Missing project' })

  // retorna cache se já existe
  const existing = await kv.get('pef:aiEvals') || {}
  if (existing[project.id]) return res.status(200).json(existing[project.id])

  const systemPrompt = `Você é um avaliador especialista em venture capital e inovação.
Avalie o business project nos 15 critérios com escala 1-5.
1=Insuficiente | 2=Abaixo do esperado | 3=Adequado | 4=Bom | 5=Excepcional
Retorne APENAS JSON válido, sem markdown, sem texto adicional.`

  const userPrompt = `Avalie:
PROJETO: ${project.projectName}
DONO: ${project.ownerName}
SETOR: ${project.sector} | ESTÁGIO: ${project.stage} | MERCADO: ${project.targetMarket}
CAPTAÇÃO: ${project.askAmount}
PROBLEMA: ${project.problem}
SOLUÇÃO: ${project.solution}
MERCADO: ${project.market}
MODELO: ${project.businessModel}
TIME: ${project.team}
FINANCEIRO: ${project.financials}

Retorne exatamente este JSON:
{
  "scores": {
    "p1":3,"p2":3,"p3":3,"s1":3,"s2":3,
    "m1":3,"m2":3,"n1":3,"n2":3,
    "t1":3,"t2":3,"v1":3,"v2":3,"f1":3,"f2":3
  },
  "notes": {
    "pros": "texto",
    "cons": "texto",
    "objections": "texto",
    "general": "texto",
    "highlights": ["item1","item2","item3"],
    "lowlights": ["item1","item2","item3"]
  }
}`

  let lastError = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })

      if (!response.ok) {
        lastError = `HTTP ${response.status}`
        await new Promise(r => setTimeout(r, 1500 * attempt))
        continue
      }

      const data = await response.json()
      const text = data.content?.find(b => b.type === 'text')?.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) { lastError = 'JSON não encontrado'; continue }

      const parsed = JSON.parse(jsonMatch[0])
      const KEYS = ['p1','p2','p3','s1','s2','m1','m2','n1','n2','t1','t2','v1','v2','f1','f2']
      for (const k of KEYS) {
        const v = Number(parsed.scores?.[k])
        parsed.scores[k] = Math.min(5, Math.max(1, isNaN(v) ? 3 : Math.round(v)))
      }
      if (!Array.isArray(parsed.notes?.highlights)) parsed.notes.highlights = []
      if (!Array.isArray(parsed.notes?.lowlights))  parsed.notes.lowlights  = []

      const allAI = await kv.get('pef:aiEvals') || {}
      allAI[project.id] = parsed
      await kv.set('pef:aiEvals', allAI)

      return res.status(200).json(parsed)

    } catch (e) {
      lastError = e.message
      await new Promise(r => setTimeout(r, 1500 * attempt))
    }
  }

  const fallback = {
    scores: Object.fromEntries(['p1','p2','p3','s1','s2','m1','m2','n1','n2','t1','t2','v1','v2','f1','f2'].map(k => [k, 3])),
    notes: {
      pros: 'Análise automática indisponível.',
      cons: 'Não foi possível gerar análise automática.',
      objections: '—',
      general: `Erro: ${lastError}`,
      highlights: ['Análise IA não disponível'],
      lowlights: ['Tente re-submeter o projeto'],
    }
  }
  return res.status(200).json(fallback)
}