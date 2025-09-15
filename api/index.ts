import express from 'express'
import cookieParser from 'cookie-parser'
import OpenAI from 'openai'
import type { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAuth, getUser } from './firebaseAuth'

const prisma = new PrismaClient()
const app = express()
app.use(express.json())
app.use(cookieParser())

function requireAdminish(req: Request, res: Response, next: NextFunction) {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const role = (user.claims as any)?.role as string | undefined
  const founderEmail = process.env.FOUNDER_EMAIL?.toLowerCase()
  const email = (user.email || '').toLowerCase()
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

    const { messages, system } = req.body as { messages?: { role: 'user' | 'assistant' | 'system'; content: string }[]; system?: string }
    const safeMessages = Array.isArray(messages) ? messages : []

    const client = new OpenAI({ apiKey })
    const defaultSystem = 'You are the helpful FirstClass dashboard assistant. Be concise and actionable.'
    const sys = { role: 'system' as const, content: system && typeof system === 'string' ? system : defaultSystem }
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

// ---------- Public Onboarding Submit ----------
// Accepts onboarding submissions from the in-app form and stores them as a Request of type ONBOARDING.
// Optionally syncs a record to Airtable if env is configured.
app.post('/api/onboarding/submit', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      brand: z.string().min(1),
      website: z.string().optional().nullable(),
      instagram: z.string().optional().nullable(),
      twitter: z.string().optional().nullable(),
      youtube: z.string().optional().nullable(),
      goals: z.string().min(1),
      pillars: z.string().optional().nullable(),
      channels: z.array(z.string()).optional().default([]),
      cadence: z.string().min(1),
      approvalFlow: z.string().optional().nullable(),
      assetsUrl: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const d = parsed.data

    // Find or create a Client, then create linked Request
    const existingByOwner = await prisma.client.findFirst({ where: { ownerEmail: d.email } })
    const existingByName = existingByOwner ? null : await prisma.client.findFirst({ where: { name: d.brand } })
    let client = existingByOwner || existingByName || await prisma.client.create({
      data: { name: d.brand, ownerEmail: d.email, status: 'ACTIVE' as any },
    })

    // Drive folder creation removed per latest requirements.

    const subject = `Onboarding: ${d.brand}`
    const created = await prisma.request.create({
      data: {
        type: 'ONBOARDING' as any,
        subject,
        requesterEmail: d.email,
        clientId: client.id,
      },
    })
    // Store detail note with a compact summary
    const summary = [
      `Name: ${d.name}`,
      `Brand: ${d.brand}`,
      d.website ? `Website: ${d.website}` : null,
      `Goals: ${d.goals}`,
      d.pillars ? `Pillars/Voice: ${d.pillars}` : null,
      `Channels: ${(d.channels || []).join(', ') || 'n/a'}`,
      `Cadence: ${d.cadence}`,
      d.approvalFlow ? `Approval: ${d.approvalFlow}` : null,
      d.assetsUrl ? `Assets: ${d.assetsUrl}` : null,
      d.instagram ? `Instagram: ${d.instagram}` : null,
      d.twitter ? `Twitter: ${d.twitter}` : null,
      d.youtube ? `YouTube: ${d.youtube}` : null,
      d.notes ? `Notes: ${d.notes}` : null,
    ].filter(Boolean).join('\n')
    await prisma.requestNote.create({ data: { requestId: created.id, author: d.email, text: summary } })

    // Persist structured onboarding payload linked to client and request
    try {
      await prisma.onboarding.create({ data: { clientId: client.id, requestId: created.id, data: d as any } as any })
    } catch (e) {
      console.error('onboarding_persist_error', e)
    }

    // Optional: push to Airtable if configured
    const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID
    const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE || 'Onboarding'
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
    if (AIRTABLE_BASE && AIRTABLE_TOKEN) {
      try {
        const fields: Record<string, any> = {
          Name: d.name,
          Email: d.email,
          Brand: d.brand,
          Website: d.website || '',
          Instagram: d.instagram || '',
          Twitter: d.twitter || '',
          YouTube: d.youtube || '',
          Goals: d.goals,
          Pillars: d.pillars || '',
          Channels: (d.channels || []).join(', '),
          Cadence: d.cadence,
          Approval: d.approvalFlow || '',
          AssetsURL: d.assetsUrl || '',
          Notes: d.notes || '',
          RequestId: created.id,
          ClientId: client.id,
          CreatedAt: new Date().toISOString(),
        }
        await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: [{ fields }] }),
          })
      } catch (err) {
        console.error('airtable_sync_error', err)
        await prisma.requestNote.create({ data: { requestId: created.id, author: 'system', text: 'Airtable sync failed. Check credentials.' } })
      }
    }

    res.json({ ok: true, id: created.id })
  } catch (err: any) {
    console.error('onboarding_submit_error', err)
    res.status(500).json({ error: err?.message || 'Server error' })
  }
})

// ---------- OAuth Social Connections (user) ----------
import crypto from 'node:crypto'

type ProviderKey = 'linkedin' | 'google'
const providers: Record<ProviderKey, {
  authorizeUrl: string
  tokenUrl: string
  scope: string
  clientId?: string
  clientSecret?: string
}> = {
  linkedin: {
    authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope: 'r_liteprofile r_emailaddress w_member_social',
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
}

const OAUTH_BASE = process.env.OAUTH_REDIRECT_BASE

// Firebase auth for user endpoints
app.use('/api/social', requireAuth)

app.get('/api/social/providers', (_req, res) => {
  const available = Object.entries(providers).filter(([, p]) => p.clientId && p.clientSecret).map(([k]) => k)
  res.json({ providers: available })
})

app.get('/api/social/connections', async (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const rows = await prisma.socialAccount.findMany({ where: { userId: user.uid }, orderBy: { createdAt: 'desc' } })
  res.json(rows.map(r => ({ id: r.id, provider: r.provider, handle: r.handle, createdAt: r.createdAt })))
})

// Start OAuth: redirects to provider
app.get('/api/social/:provider/auth', (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).send('Unauthorized')
  const provider = req.params.provider as ProviderKey
  const cfg = providers[provider]
  if (!cfg || !cfg.clientId || !cfg.clientSecret) return res.status(501).send('Provider not configured')
  if (!OAUTH_BASE) return res.status(501).send('OAUTH_REDIRECT_BASE not set')
  const redirectUri = `${OAUTH_BASE.replace(/\/$/, '')}/api/social/${provider}/callback`
  const state = crypto.randomBytes(16).toString('hex')
  res.cookie(`oauth_state_${provider}`, `${state}:${user.uid}`, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 10 * 60 * 1000, path: '/' })
  const url = new URL(cfg.authorizeUrl)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', cfg.clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', cfg.scope)
  url.searchParams.set('state', state)
  if (provider === 'google') {
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('prompt', 'consent')
  }
  res.redirect(url.toString())
})

// OAuth callback: exchanges code for tokens and stores connection
app.get('/api/social/:provider/callback', async (req, res) => {
  const provider = req.params.provider as ProviderKey
  const cfg = providers[provider]
  if (!cfg || !cfg.clientId || !cfg.clientSecret) return res.status(501).send('Provider not configured')
  if (!OAUTH_BASE) return res.status(501).send('OAUTH_REDIRECT_BASE not set')
  const { code, state } = req.query as { code?: string; state?: string }
  const cookieState = (req.cookies?.[`oauth_state_${provider}`] || '') as string
  res.clearCookie(`oauth_state_${provider}`, { path: '/' })
  const [savedState, userId] = cookieState.split(':')
  if (!code || !state || state !== savedState || !userId) {
    return res.status(400).send('Invalid state')
  }
  const redirectUri = `${OAUTH_BASE.replace(/\/$/, '')}/api/social/${provider}/callback`
  // Exchange code for token
  const body = new URLSearchParams()
  body.set('grant_type', 'authorization_code')
  body.set('code', code)
  body.set('redirect_uri', redirectUri)
  body.set('client_id', cfg.clientId)
  body.set('client_secret', cfg.clientSecret)
  try {
    const tokenRes = await fetch(cfg.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    const token = await tokenRes.json() as any
    if (!tokenRes.ok) {
      console.error('oauth_token_error', token)
      return res.status(502).send('Token exchange failed')
    }
    const accessToken = token.access_token as string
    const refreshToken = (token.refresh_token as string | undefined) ?? null
    const expiresAt = token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000) : null

    // Fetch basic profile for handle/accountId
    let accountId = 'unknown'
    let handle: string | null = null
    if (provider === 'linkedin') {
      const me = await fetch('https://api.linkedin.com/v2/me', { headers: { Authorization: `Bearer ${accessToken}` } })
      const mj = await me.json() as any
      accountId = mj.id || 'unknown'
      handle = mj.localizedFirstName ? `${mj.localizedFirstName} ${mj.localizedLastName || ''}`.trim() : null
    } else if (provider === 'google') {
      const ch = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: { Authorization: `Bearer ${accessToken}` } })
      const cj = await ch.json() as any
      const item = cj.items?.[0]
      accountId = item?.id || 'unknown'
      handle = item?.snippet?.title || null
    }

    await prisma.socialAccount.upsert({
      where: { userId_provider_accountId: { userId, provider, accountId } as any },
      update: { accessToken, refreshToken: refreshToken ?? undefined, scope: token.scope || undefined, expiresAt: (expiresAt as any) ?? undefined, handle: handle ?? undefined },
      create: { userId, provider, accountId, handle: handle ?? undefined, accessToken, refreshToken: refreshToken ?? undefined, scope: token.scope || undefined, expiresAt: (expiresAt as any) ?? undefined },
    } as any)

    res.redirect('/dashboard/settings?connected=' + provider)
  } catch (err) {
    console.error('oauth_callback_error', err)
    res.status(500).send('OAuth failed')
  }
})

app.delete('/api/social/:id', async (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  const row = await prisma.socialAccount.findUnique({ where: { id } })
  if (!row || row.userId !== userId) return res.status(404).json({ error: 'Not found' })
  await prisma.socialAccount.delete({ where: { id } })
  res.json({ ok: true })
})

// Apply Firebase auth to admin endpoints only
app.use('/api/admin', requireAuth)

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

// ----- Client Onboarding Update (Admin) -----
app.put('/api/admin/clients/:id/onboarding', requireAdminish, async (req, res) => {
  const { id } = req.params
  const sync = String(req.query.sync || '0') === '1'
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    brand: z.string().min(1),
    website: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    twitter: z.string().optional().nullable(),
    youtube: z.string().optional().nullable(),
    goals: z.string().min(1),
    pillars: z.string().optional().nullable(),
    channels: z.array(z.string()).optional().default([]),
    cadence: z.string().min(1),
    approvalFlow: z.string().optional().nullable(),
    assetsUrl: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const d = parsed.data

  try {
    const client = await prisma.client.findUnique({ where: { id } })
    if (!client) return res.status(404).json({ error: 'Client not found' })

    const created = await prisma.onboarding.create({ data: { clientId: id, requestId: (await ensureOnboardingRequest(id, d)).id, data: d as any } as any })

    if (sync) {
      const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID
      const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE || 'Onboarding'
      const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
      if (AIRTABLE_BASE && AIRTABLE_TOKEN) {
        try {
          const fields: Record<string, any> = {
            Name: d.name,
            Email: d.email,
            Brand: d.brand,
            Website: d.website || '',
            Instagram: d.instagram || '',
            Twitter: d.twitter || '',
            YouTube: d.youtube || '',
            Goals: d.goals,
            Pillars: d.pillars || '',
            Channels: (d.channels || []).join(', '),
            Cadence: d.cadence,
            Approval: d.approvalFlow || '',
            AssetsURL: d.assetsUrl || '',
            Notes: d.notes || '',
            ClientId: id,
            RequestId: created.requestId,
            SyncedAt: new Date().toISOString(),
          }
          await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`,
            {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ records: [{ fields }] }),
            })
        } catch (err) {
          console.error('airtable_sync_error', err)
        }
      }
    }

    res.json({ ok: true, onboardingId: created.id })
  } catch (err: any) {
    console.error('onboarding_update_error', err)
    res.status(500).json({ error: err?.message || 'Server error' })
  }
})

async function ensureOnboardingRequest(clientId: string, d: { brand: string; email: string }) {
  // Try to find the latest ONBOARDING request for this client; else create one
  const existing = await prisma.request.findFirst({ where: { clientId, type: 'ONBOARDING' as any }, orderBy: { createdAt: 'desc' } })
  if (existing) return existing
  return prisma.request.create({ data: { type: 'ONBOARDING' as any, subject: `Onboarding: ${d.brand}`, requesterEmail: d.email, clientId } })
}

// ----- Client Onboarding (latest) -----
app.get('/api/admin/clients/:id/onboarding', requireAdminish, async (req, res) => {
  const { id } = req.params
  const row = await prisma.onboarding.findFirst({ where: { clientId: id }, orderBy: { createdAt: 'desc' } })
  if (!row) return res.json(null)
  res.json({ createdAt: row.createdAt, data: row.data })
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
