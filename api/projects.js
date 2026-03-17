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
    const projects = await kv.get('pef:projects') || []
    return res.status(200).json(projects)
  }

  if (req.method === 'POST') {
    const project = req.body
    if (!project?.id) return res.status(400).json({ error: 'Missing project id' })
    const projects = await kv.get('pef:projects') || []
    // evita duplicatas
    if (projects.find(p => p.id === project.id)) {
      return res.status(200).json({ ok: true, duplicate: true })
    }
    projects.push(project)
    await kv.set('pef:projects', projects)
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}