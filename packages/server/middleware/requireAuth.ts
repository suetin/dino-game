import type { Request, Response, NextFunction } from 'express'
import { hasValidSession } from '../auth/session'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (hasValidSession(req)) {
    next()
    return
  }
  res.status(403).json({ message: 'Нет доступа: требуется авторизация' })
}
