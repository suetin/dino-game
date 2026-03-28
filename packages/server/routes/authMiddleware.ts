import type { Request, Response, NextFunction } from 'express'

// Временная заглушка авторизации для соответствия требованиям бэклога
// В реальном приложении здесь должна быть проверка сессии/JWT/Cookie
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Для проверки можно передавать заголовок x-auth-user-id
  const userId = req.headers['x-auth-user-id'] || req.body.author_id || req.body.user_id

  if (!userId) {
    res.status(403).json({ error: 'Forbidden: User is not authorized' })
    return
  }

  next()
}
