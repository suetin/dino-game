import type { Request, Response } from 'express'
import crypto from 'crypto'

export const SESSION_COOKIE_NAME = process.env.AUTH_SESSION_COOKIE?.trim() || 'dino_session'

type SessionData = {
  userId: number
  createdAt: number
}

const sessions = new Map<string, SessionData>()

const ONE_WEEK_SEC = 60 * 60 * 24 * 7

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie
  if (!header) {
    return undefined
  }

  const parts = header.split(';').map(c => c.trim())

  for (const part of parts) {
    const eq = part.indexOf('=')
    if (eq === -1) continue

    const key = part.slice(0, eq).trim()
    if (key !== name) continue

    const value = part.slice(eq + 1)

    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  return undefined
}

function appendSetCookie(res: Response, value: string, maxAgeSec: number): void {
  const segments = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ]

  res.append('Set-Cookie', segments.join('; '))
}

function getSessionId(req: Request): string | null {
  return readCookie(req, SESSION_COOKIE_NAME) ?? null
}

export function createSession(res: Response, userId: number) {
  const sessionId = crypto.randomUUID()

  sessions.set(sessionId, {
    userId,
    createdAt: Date.now(),
  })

  appendSetCookie(res, sessionId, ONE_WEEK_SEC)
}

export function destroySession(req: Request, res: Response): void {
  const token = getSessionId(req)

  if (token) {
    sessions.delete(token)
  }

  appendSetCookie(res, '', 0)
}

export function hasValidSession(req: Request): boolean {
  return getUserIdFromSession(req) !== null
}

export function getUserIdFromSession(req: Request): number | null {
  const token = getSessionId(req)

  if (!token) return null

  const session = sessions.get(token)

  return session?.userId ?? null
}
