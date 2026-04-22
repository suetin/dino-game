import type { Request, Response } from 'express'
import { User } from '../models/User'

export function getRequestUserOrUnauthorized(req: Request, res: Response): User | null {
  if (!req.user) {
    res.status(401).json({ reason: 'Unauthorized' })
    return null
  }

  return req.user
}
