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
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return escapeHtml(value.trim())
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue)
    }
    if (value !== null && typeof value === 'object') {
      const sanitizedObj: any = {}
      for (const key in value) {
        sanitizedObj[key] = sanitizeValue(value[key])
      }
      return sanitizedObj
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
