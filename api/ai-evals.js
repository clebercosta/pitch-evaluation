import { Redis } from '@upstash/redis'
const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    const aiEvals = await kv.get('pef:aiEvals') || {}
    return res.status(200).json(aiEvals)
  }

  if (req.method === 'POST') {
    const { projectId, aiResult } = req.body
    if (!projectId || !aiResult) return res.status(400).json({ error: 'Missing projectId or aiResult' })
    const all = await kv.get('pef:aiEvals') || {}
    all[projectId] = aiResult
    await kv.set('pef:aiEvals', all)
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}