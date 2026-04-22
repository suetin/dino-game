import type { Request, Response, NextFunction } from 'express'
import { getUserIdFromSession } from '../auth/session'
import { User } from '../models/User'

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await getUserIdFromSession(req)

    if (userId === null) {
      res.status(401).json({ reason: 'Unauthorized' })
      return
    }

    const user = await User.findByPk(userId)
    if (!user) {
      res.status(401).json({ reason: 'Unauthorized' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}
