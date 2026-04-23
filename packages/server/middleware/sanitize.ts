import type { Request, Response, NextFunction } from 'express'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function sanitize(req: Request, _res: Response, next: NextFunction): void {
  const sanitizeValue = <T>(value: T): T => {
    if (typeof value === 'string') {
      return escapeHtml(value.trim()) as T
    }
    if (Array.isArray(value)) {
      return value.map(item => sanitizeValue(item)) as T
    }
    if (value !== null && typeof value === 'object') {
      const sanitizedObj: Record<string, unknown> = {}
      for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
        sanitizedObj[key] = sanitizeValue(nestedValue)
      }
      return sanitizedObj as T
    }
    return value
  }

  if (req.body) {
    req.body = sanitizeValue(req.body)
  }
  if (req.query) {
    req.query = sanitizeValue(req.query)
  }
  if (req.params) {
    req.params = sanitizeValue(req.params)
  }

  next()
}
