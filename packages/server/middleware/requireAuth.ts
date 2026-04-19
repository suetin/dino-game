import type { Request, Response, NextFunction } from 'express'
import { getUserIdFromSession } from '../auth/session'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (getUserIdFromSession(req) !== null) {
    next()
    return
  }

  res.status(401).json({ reason: 'Unauthorized' })
}
