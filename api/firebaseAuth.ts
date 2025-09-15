import type { Request, Response, NextFunction } from 'express'
import admin from 'firebase-admin'

// Initialize Firebase Admin if not already
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[firebase-admin] Missing service account env. Admin endpoints will fail.')
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    })
  }
}

export type AuthedUser = { uid: string; email?: string | null; claims?: admin.auth.DecodedIdToken }

declare global {
  // eslint-disable-next-line no-var
  var __firebaseAdminReady: boolean | undefined
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization') || req.header('Authorization')
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const appInitialized = admin.apps.length > 0
    if (!appInitialized) return res.status(500).json({ error: 'Auth not configured' })
    admin
      .auth()
      .verifyIdToken(token)
      .then((decoded) => {
        ;(req as any).user = { uid: decoded.uid, email: decoded.email, claims: decoded } as AuthedUser
        next()
      })
      .catch(() => res.status(401).json({ error: 'Invalid token' }))
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export function getUser(req: Request): AuthedUser | null {
  return ((req as any).user as AuthedUser | undefined) || null
}

