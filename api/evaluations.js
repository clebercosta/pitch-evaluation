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
    const evaluations = await kv.get('pef:evaluations') || []
    return res.status(200).json(evaluations)
  }

  if (req.method === 'POST') {
    const evaluation = req.body
    if (!evaluation?.id) return res.status(400).json({ error: 'Missing evaluation id' })
    const evaluations = await kv.get('pef:evaluations') || []
    if (evaluations.find(e => e.id === evaluation.id)) {
      return res.status(200).json({ ok: true, duplicate: true })
    }
    evaluations.push(evaluation)
    await kv.set('pef:evaluations', evaluations)
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}