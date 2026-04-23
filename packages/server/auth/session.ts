import type { Request, Response } from 'express'
import crypto from 'crypto'
import { Op } from 'sequelize'
import { AuthSession } from '../models/AuthSession'
import { runtimeConfig } from '../config/runtimeConfig'
import { clearCookie, readCookie, setCookie } from './cookie'

export const SESSION_COOKIE_NAME = runtimeConfig.sessionCookieName

const ONE_WEEK_SEC = 60 * 60 * 24 * 7
const ONE_WEEK_MS = ONE_WEEK_SEC * 1000
const EXPIRED_SESSIONS_CLEANUP_INTERVAL_MS = 60 * 1000

let lastExpiredSessionsCleanup = 0

function getSessionId(req: Request): string | null {
  return readCookie(req, SESSION_COOKIE_NAME) ?? null
}

async function cleanupExpiredSessions(now: Date): Promise<void> {
  const nowMs = now.getTime()

  if (nowMs - lastExpiredSessionsCleanup < EXPIRED_SESSIONS_CLEANUP_INTERVAL_MS) {
    return
  }

  lastExpiredSessionsCleanup = nowMs

  await AuthSession.destroy({
    where: {
      expires_at: {
        [Op.lte]: now,
      },
    },
  })
}

export async function createSession(req: Request, res: Response, userId: number): Promise<void> {
  const now = new Date()
  await cleanupExpiredSessions(now)

  const previousToken = getSessionId(req)

  if (previousToken) {
    await AuthSession.destroy({ where: { id: previousToken } })
  }

  const sessionId = crypto.randomUUID()

  await AuthSession.create({
    id: sessionId,
    user_id: userId,
    created_at: now,
    expires_at: new Date(now.getTime() + ONE_WEEK_MS),
  })

  setCookie(res, SESSION_COOKIE_NAME, sessionId, {
    maxAgeSec: ONE_WEEK_SEC,
    httpOnly: true,
    request: req,
  })
}

export async function destroySession(req: Request, res: Response): Promise<void> {
  const now = new Date()
  await cleanupExpiredSessions(now)

  const token = getSessionId(req)

  if (token) {
    await AuthSession.destroy({ where: { id: token } })
  }

  clearCookie(res, SESSION_COOKIE_NAME, { httpOnly: true, request: req })
}

export async function getUserIdFromSession(req: Request): Promise<number | null> {
  const token = getSessionId(req)

  if (!token) {
    return null
  }

  const now = new Date()
  await cleanupExpiredSessions(now)

  const session = await AuthSession.findByPk(token)

  if (!session) {
    return null
  }

  if (session.expires_at.getTime() <= now.getTime()) {
    await session.destroy()
    return null
  }

  return session.user_id
}
