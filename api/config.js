const { Redis } = require('@upstash/redis')

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    const config = await kv.get('pef:config') || null
    const phase  = await kv.get('pef:phase')  || 'setup'
    return res.status(200).json({ config, phase })
  }

  if (req.method === 'POST') {
    const { config, phase } = req.body
    if (config !== undefined) await kv.set('pef:config', config)
    if (phase  !== undefined) await kv.set('pef:phase',  phase)
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    await kv.del('pef:config')
    await kv.del('pef:phase')
    await kv.del('pef:projects')
    await kv.del('pef:evaluations')
    await kv.del('pef:aiEvals')
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}