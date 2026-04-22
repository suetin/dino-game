import crypto from 'crypto'
import { Router, Request, Response, NextFunction } from 'express'
import { UniqueConstraintError } from 'sequelize'
import { createSession, destroySession } from './session'
import { runtimeConfig } from '../config/runtimeConfig'
import { clearCookie, readCookie, setCookie } from './cookie'
import { requireAuth } from '../middleware/requireAuth'
import { getRequestUserOrUnauthorized } from '../middleware/requestUser'
import {
  authenticateYandexOAuth,
  buildYandexAuthorizationUrl,
  getYandexOAuthConfig,
  getYandexRedirectUriAllowlist,
  normalizeRedirectUri,
  OAuthConflictError,
  OAuthProfileError,
  OAuthProviderHttpError,
} from './oauthService'
import {
  createUserWithPassword,
  hasUserConflict,
  normalizeLoginOrEmail,
  normalizeValue,
  verifyPasswordSignIn,
} from './authService'
import { toClientUserResponse } from './userSerialization'
const OAUTH_STATE_COOKIE_NAME = 'dino_oauth_state'
const OAUTH_STATE_TTL_SEC = runtimeConfig.oauthStateTtlSec

type SignInBody = {
  login?: unknown
  password?: unknown
}

type SignUpBody = {
  email?: unknown
  password?: unknown
  first_name?: unknown
  second_name?: unknown
  login?: unknown
  phone?: unknown
}

type OAuthBody = {
  code?: unknown
  state?: unknown
  redirect_uri?: unknown
}

function createRateLimitMiddleware(options: {
  windowMs: number
  maxRequests: number
  keyPrefix: string
}) {
  const storage = new Map<string, { count: number; resetAt: number }>()

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now()
    const ip = req.ip || 'unknown'
    const key = `${options.keyPrefix}:${ip}`
    const current = storage.get(key)

    if (!current || current.resetAt <= now) {
      storage.set(key, { count: 1, resetAt: now + options.windowMs })
      next()
      return
    }

    if (current.count >= options.maxRequests) {
      res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000))
      res.status(429).json({ reason: 'Too many requests' })
      return
    }

    current.count += 1
    next()
  }
}

const authSignInRateLimit = createRateLimitMiddleware({
  keyPrefix: 'auth-signin',
  windowMs: 60_000,
  maxRequests: 20,
})
const authSignUpRateLimit = createRateLimitMiddleware({
  keyPrefix: 'auth-signup',
  windowMs: 60_000,
  maxRequests: 10,
})
const oauthRateLimit = createRateLimitMiddleware({
  keyPrefix: 'oauth-yandex',
  windowMs: 60_000,
  maxRequests: 30,
})

export function createAuthRouter(): Router {
  const router = Router()

  router.post('/auth/signin', authSignInRateLimit, async (req: Request, res: Response) => {
    const { login, password } = (req.body ?? {}) as SignInBody

    if (typeof login !== 'string' || typeof password !== 'string' || !login.trim() || !password) {
      return res.status(400).json({ reason: 'Логин и пароль обязательны' })
    }

    try {
      const user = await verifyPasswordSignIn(login, password)

      if (!user) {
        return res.status(401).json({ reason: 'Неверный логин или пароль' })
      }

      await createSession(req, res, user.id)

      return res.json(toClientUserResponse(user))
    } catch (error) {
      console.error('Sign in failed:', error)
      return res.status(500).json({ reason: 'Internal Server Error' })
    }
  })

  router.post('/auth/signup', authSignUpRateLimit, async (req: Request, res: Response) => {
    const { email, password, first_name, second_name, login, phone } = (req.body ??
      {}) as SignUpBody

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof first_name !== 'string' ||
      typeof second_name !== 'string' ||
      typeof login !== 'string' ||
      typeof phone !== 'string'
    ) {
      return res.status(400).json({ reason: 'Некорректные данные регистрации' })
    }

    const nextEmail = normalizeLoginOrEmail(email)
    const nextFirstName = normalizeValue(first_name)
    const nextSecondName = normalizeValue(second_name)
    const nextLogin = normalizeLoginOrEmail(login)
    const nextPhone = normalizeValue(phone)

    if (!nextEmail || !password || !nextFirstName || !nextSecondName || !nextLogin || !nextPhone) {
      return res.status(400).json({ reason: 'Все поля обязательны' })
    }

    try {
      if (await hasUserConflict(nextLogin, nextEmail)) {
        return res
          .status(409)
          .json({ reason: 'Пользователь с таким логином или email уже существует' })
      }

      const newUser = await createUserWithPassword({
        email: nextEmail,
        password,
        firstName: nextFirstName,
        secondName: nextSecondName,
        login: nextLogin,
        phone: nextPhone,
      })

      await createSession(req, res, newUser.id)

      return res.json(toClientUserResponse(newUser))
    } catch (error) {
      if (
        error instanceof UniqueConstraintError ||
        (error instanceof Error && error.message === 'USER_CONFLICT')
      ) {
        return res
          .status(409)
          .json({ reason: 'Пользователь с таким логином или email уже существует' })
      }

      console.error('Sign up failed:', error)
      return res.status(500).json({ reason: 'Internal Server Error' })
    }
  })

  router.get('/oauth/yandex/start', oauthRateLimit, (req: Request, res: Response) => {
    const redirectUri = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : ''
    if (!redirectUri.trim()) {
      return res.status(400).json({ reason: 'redirect_uri is required' })
    }

    const normalizedRedirectUri = normalizeRedirectUri(redirectUri.trim())
    if (!normalizedRedirectUri) {
      return res.status(400).json({ reason: 'redirect_uri is invalid' })
    }

    const redirectUriAllowlist = getYandexRedirectUriAllowlist()
    if (!redirectUriAllowlist.has(normalizedRedirectUri)) {
      return res.status(400).json({ reason: 'redirect_uri is not allowlisted' })
    }

    const oauthConfig = getYandexOAuthConfig()
    if (!oauthConfig) {
      return res.status(500).json({ reason: 'Yandex OAuth is not configured on server' })
    }

    const state = crypto.randomUUID()
    setCookie(res, OAUTH_STATE_COOKIE_NAME, state, {
      maxAgeSec: OAUTH_STATE_TTL_SEC,
      httpOnly: true,
      request: req,
    })

    return res.json({
      authorization_url: buildYandexAuthorizationUrl({
        clientId: oauthConfig.clientId,
        redirectUri: normalizedRedirectUri,
        state,
      }),
    })
  })

  router.post('/oauth/yandex', oauthRateLimit, async (req: Request, res: Response) => {
    const { code, state, redirect_uri } = (req.body ?? {}) as OAuthBody

    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ reason: 'OAuth code is required' })
    }
    if (typeof state !== 'string' || !state.trim()) {
      return res.status(400).json({ reason: 'OAuth state is required' })
    }
    if (typeof redirect_uri !== 'string' || !redirect_uri.trim()) {
      return res.status(400).json({ reason: 'redirect_uri is required' })
    }

    const stateFromCookie = readCookie(req, OAUTH_STATE_COOKIE_NAME)
    clearCookie(res, OAUTH_STATE_COOKIE_NAME, { httpOnly: true, request: req })
    if (!stateFromCookie || stateFromCookie !== state.trim()) {
      return res.status(401).json({ reason: 'OAuth state mismatch' })
    }

    const normalizedRedirectUri = normalizeRedirectUri(redirect_uri.trim())
    if (!normalizedRedirectUri) {
      return res.status(400).json({ reason: 'redirect_uri is invalid' })
    }

    const redirectUriAllowlist = getYandexRedirectUriAllowlist()
    if (!redirectUriAllowlist.has(normalizedRedirectUri)) {
      return res.status(400).json({ reason: 'redirect_uri is not allowlisted' })
    }

    try {
      const user = await authenticateYandexOAuth({
        code: code.trim(),
        redirectUri: normalizedRedirectUri,
      })

      await createSession(req, res, user.id)

      return res.json(toClientUserResponse(user))
    } catch (error) {
      if (error instanceof OAuthConflictError) {
        return res.status(409).json({ reason: error.message })
      }

      if (error instanceof OAuthProfileError) {
        return res.status(401).json({ reason: 'OAuth profile data is incomplete' })
      }

      if (error instanceof OAuthProviderHttpError) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          return res.status(401).json({ reason: 'OAuth authorization failed' })
        }

        if (error.statusCode === 504) {
          return res.status(504).json({ reason: 'OAuth provider timeout' })
        }

        return res.status(502).json({ reason: 'OAuth provider request failed' })
      }

      if (error instanceof Error && error.message === 'YANDEX_OAUTH_NOT_CONFIGURED') {
        return res.status(500).json({ reason: 'Yandex OAuth is not configured on server' })
      }

      console.error('OAuth sign in failed:', error)
      return res.status(500).json({ reason: 'Internal Server Error' })
    }
  })

  router.get('/oauth/yandex/service-id', (_req: Request, res: Response) => {
    const serviceId = process.env.YANDEX_OAUTH_CLIENT_ID?.trim()
    if (!serviceId) {
      return res.status(500).json({ reason: 'Yandex OAuth is not configured on server' })
    }
    return res.json({ service_id: serviceId })
  })

  router.use('/auth/user', requireAuth)
  router.get('/auth/user', async (req: Request, res: Response) => {
    try {
      const user = getRequestUserOrUnauthorized(req, res)
      if (!user) return

      return res.json(toClientUserResponse(user))
    } catch (error) {
      console.error('Failed to fetch auth user:', error)
      return res.status(500).json({ reason: 'Internal Server Error' })
    }
  })

  router.post('/auth/logout', async (req: Request, res: Response) => {
    try {
      await destroySession(req, res)
      return res.sendStatus(200)
    } catch (error) {
      console.error('Logout failed:', error)
      return res.status(500).json({ reason: 'Internal Server Error' })
    }
  })

  return router
}
