import type { Request, Response } from 'express'

function parseCookieSecureEnv(): boolean | 'auto' {
  const raw = process.env.COOKIE_SECURE?.trim().toLowerCase()

  if (raw === 'true') {
    return true
  }

  if (raw === 'false') {
    return false
  }

  return 'auto'
}

function isHttpsRequest(req?: Request): boolean {
  if (!req) {
    return false
  }

  if (req.secure) {
    return true
  }

  const forwardedProto = req.headers['x-forwarded-proto']
  const value = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto

  if (!value) {
    return false
  }

  const firstProto = value.split(',')[0]?.trim().toLowerCase()
  return firstProto === 'https'
}

function shouldUseSecureCookie(req: Request | undefined, secureOverride?: boolean): boolean {
  if (typeof secureOverride === 'boolean') {
    return secureOverride
  }

  const secureMode = parseCookieSecureEnv()
  if (secureMode === true || secureMode === false) {
    return secureMode
  }

  return isHttpsRequest(req)
}

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie
  if (!header) {
    return undefined
  }

  const parts = header.split(';').map(cookie => cookie.trim())

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

export function setCookie(
  res: Response,
  name: string,
  value: string,
  options: {
    maxAgeSec: number
    httpOnly?: boolean
    sameSite?: 'Lax' | 'Strict' | 'None'
    secure?: boolean
    request?: Request
  }
): void {
  const segments = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `SameSite=${options.sameSite ?? 'Lax'}`,
    `Max-Age=${Math.max(0, options.maxAgeSec)}`,
  ]

  if (options.httpOnly) {
    segments.push('HttpOnly')
  }

  if (shouldUseSecureCookie(options.request, options.secure)) {
    segments.push('Secure')
  }

  res.append('Set-Cookie', segments.join('; '))
}

export function clearCookie(
  res: Response,
  name: string,
  options?: {
    httpOnly?: boolean
    sameSite?: 'Lax' | 'Strict' | 'None'
    secure?: boolean
    request?: Request
  }
): void {
  setCookie(res, name, '', {
    maxAgeSec: 0,
    httpOnly: options?.httpOnly,
    sameSite: options?.sameSite,
    secure: options?.secure,
    request: options?.request,
  })
}
