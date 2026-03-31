import type { Request, Response } from 'express'
import { randomBytes } from 'crypto'

export const SESSION_COOKIE_NAME = process.env.AUTH_SESSION_COOKIE?.trim() || 'dino_session'

const activeSessions = new Set<string>()

const ONE_WEEK_SEC = 60 * 60 * 24 * 7

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie
  if (!header) {
    return undefined
  }
  const parts = header.split(';').map(c => c.trim())
  for (const part of parts) {
    const eq = part.indexOf('=')
    if (eq === -1) {
      continue
    }
    const key = part.slice(0, eq).trim()
    if (key !== name) {
      continue
    }
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

export function createSession(res: Response): string {
  const token = randomBytes(24).toString('hex')
  activeSessions.add(token)
  appendSetCookie(res, token, ONE_WEEK_SEC)
  return token
}

export function destroySession(req: Request, res: Response): void {
  const token = readCookie(req, SESSION_COOKIE_NAME)
  if (token) {
    activeSessions.delete(token)
  }
  res.append('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
}

export function hasValidSession(req: Request): boolean {
  const token = readCookie(req, SESSION_COOKIE_NAME)
  return Boolean(token && activeSessions.has(token))
}
