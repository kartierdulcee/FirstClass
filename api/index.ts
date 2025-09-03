import express from 'express'
import OpenAI from 'openai'
import type { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { clerkMiddleware, getAuth } from '@clerk/express'

const prisma = new PrismaClient()
const app = express()
app.use(express.json())

function requireAdminish(req: Request, res: Response, next: NextFunction) {
  const { userId, sessionClaims } = getAuth(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const role = (sessionClaims?.public_metadata as any)?.role
  const founderEmail = process.env.FOUNDER_EMAIL?.toLowerCase()
  const email = (sessionClaims?.email as string | undefined)?.toLowerCase()
  const allowed = role === 'admin' || role === 'manager' || (founderEmail && email === founderEmail)
  if (!allowed) return res.status(403).json({ error: 'Forbidden' })
  next()
}

app.get('/api/healthz', (_req, res) => res.json({ ok: true }))

// Simple AI assistant endpoint
app.post('/api/assistant', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return res.status(501).json({ error: 'AI not configured (missing OPENAI_API_KEY)' })

    const { messages } = req.body as { messages?: { role: 'user' | 'assistant' | 'system'; content: string }[] }
    const safeMessages = Array.isArray(messages) ? messages : []

    const client = new OpenAI({ apiKey })
    const sys = {
      role: 'system' as const,
      content: 'You are the helpful FirstClass dashboard assistant. Be concise and actionable.'
    }
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [sys, ...safeMessages],
      temperature: 0.2,
    })
    const reply = completion.choices[0]?.message?.content || ''
    res.json({ reply })
  } catch (err: any) {
    console.error('assistant_error', err)
    res.status(500).json({ error: err?.message || 'Unknown error' })
  }
})

// Apply Clerk auth to admin endpoints only
app.use('/api/admin', clerkMiddleware())

// ----- Settings -----
app.get('/api/admin/settings', requireAdminish, async (_req, res) => {
  const s = await prisma.settings.findUnique({ where: { id: 1 } })
  if (!s) {
    return res.json({ supportEmail: 'support@firstclass.ai', webhookUrl: 'https://api.firstclass.ai/webhooks', brandHue: 212, allowSelfSignup: true })
  }
  res.json(s)
})

app.put('/api/admin/settings', requireAdminish, async (req, res) => {
  const schema = z.object({
    supportEmail: z.string().email(),
    webhookUrl: z.string().url(),
    brandHue: z.number().int().min(0).max(360),
    allowSelfSignup: z.boolean(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data
  const s = await prisma.settings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  })
  res.json(s)
})

// ----- Clients -----
app.get('/api/admin/clients', requireAdminish, async (req, res) => {
  const search = String(req.query.search || '').toLowerCase()
  const status = String(req.query.status || 'all')
  const sortBy = String(req.query.sortBy || 'name')
  const sortDir = String(req.query.sortDir || 'asc') as 'asc' | 'desc'
  const page = Number(req.query.page || 1)
  const pageSize = Number(req.query.pageSize || 10)

  const where: any = {}
  if (status !== 'all') where.status = status.toUpperCase()
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { ownerEmail: { contains: search, mode: 'insensitive' } },
  ]

  const orderBy: any = {}
  orderBy[sortBy === 'owner' ? 'ownerEmail' : sortBy] = sortDir

  const [total, items] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
  ])
  res.json(items)
})

app.post('/api/admin/clients', requireAdminish, async (req, res) => {
  const schema = z.object({ name: z.string().min(2), owner: z.string().email(), status: z.enum(['active','paused']).default('active') })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { name, owner, status } = parsed.data
  const created = await prisma.client.create({ data: { name, ownerEmail: owner, status: status.toUpperCase() as any } })
  res.json(created)
})

app.post('/api/admin/clients/:id/manager', requireAdminish, async (req, res) => {
  const { id } = req.params
  const schema = z.object({ email: z.string().email() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const mgr = await prisma.clientManager.upsert({
    where: { clientId_email: { clientId: id, email: parsed.data.email } },
    update: {},
    create: { clientId: id, email: parsed.data.email },
  })
  res.json(mgr)
})

app.delete('/api/admin/clients/:id/manager', requireAdminish, async (req, res) => {
  const { id } = req.params
  const schema = z.object({ email: z.string().email() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  await prisma.clientManager.delete({ where: { clientId_email: { clientId: id, email: parsed.data.email } } })
  res.json({ ok: true })
})

app.get('/api/admin/clients/:id/managers', requireAdminish, async (req, res) => {
  const { id } = req.params
  const managers = await prisma.clientManager.findMany({ where: { clientId: id } })
  res.json(managers.map((m) => m.email))
})

app.get('/api/admin/clients/:id/timeline', requireAdminish, async (req, res) => {
  const { id } = req.params
  // For now, return latest requests and manager changes as basic timeline
  const [reqs, mgrs] = await Promise.all([
    prisma.request.findMany({ where: { clientId: id }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.clientManager.findMany({ where: { clientId: id }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])
  const events = [
    ...reqs.map(r => ({ id: `rq-${r.id}`, ts: r.createdAt, who: r.requesterEmail, text: `Request: ${r.subject}` })),
    ...mgrs.map(m => ({ id: `mg-${m.id}`, ts: m.createdAt, who: m.email, text: `Manager assigned` })),
  ].sort((a,b) => +new Date(b.ts) - +new Date(a.ts))
  res.json(events)
})

// ----- Requests -----
app.get('/api/admin/requests', requireAdminish, async (req, res) => {
  const search = String(req.query.search || '').toLowerCase()
  const status = String(req.query.status || 'all')
  const type = String(req.query.type || 'all')
  const sortBy = String(req.query.sortBy || 'createdAt')
  const sortDir = String(req.query.sortDir || 'desc') as 'asc' | 'desc'
  const page = Number(req.query.page || 1)
  const pageSize = Number(req.query.pageSize || 10)

  const where: any = {}
  if (status !== 'all') where.status = status.toUpperCase()
  if (type !== 'all') where.type = type.toUpperCase()
  if (search) where.OR = [
    { subject: { contains: search, mode: 'insensitive' } },
    { requesterEmail: { contains: search, mode: 'insensitive' } },
  ]
  const orderBy: any = {}
  orderBy[sortBy] = sortDir

  const [total, items] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
  ])
  res.json(items)
})

app.post('/api/admin/requests', requireAdminish, async (req, res) => {
  const schema = z.object({ type: z.enum(['onboarding','support']), subject: z.string().min(3), requester: z.string().email(), clientId: z.string().optional() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { type, subject, requester, clientId } = parsed.data
  const created = await prisma.request.create({ data: { type: type.toUpperCase() as any, subject, requesterEmail: requester, clientId } })
  res.json(created)
})

app.patch('/api/admin/requests/:id', requireAdminish, async (req, res) => {
  const { id } = req.params
  const schema = z.object({ status: z.enum(['open','in_progress','closed']).optional(), notes: z.string().optional() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data: any = {}
  if (parsed.data.status) data.status = parsed.data.status.toUpperCase()
  const updated = await prisma.request.update({ where: { id }, data })
  if (parsed.data.notes) {
    await prisma.requestNote.create({ data: { requestId: id, author: 'system', text: parsed.data.notes } })
  }
  res.json(updated)
})

app.get('/api/admin/requests/:id/timeline', requireAdminish, async (req, res) => {
  const { id } = req.params
  const notes = await prisma.requestNote.findMany({ where: { requestId: id }, orderBy: { createdAt: 'desc' } })
  const events = notes.map(n => ({ id: n.id, ts: n.createdAt, who: n.author, text: n.text }))
  res.json(events)
})

app.post('/api/admin/requests/:id/notes', requireAdminish, async (req, res) => {
  const { id } = req.params
  const schema = z.object({ note: z.string().min(1) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const created = await prisma.requestNote.create({ data: { requestId: id, author: 'system', text: parsed.data.note } })
  res.json(created)
})

// Vercel handler export
export default app
