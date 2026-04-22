import './loadEnv'
import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { createAuthRouter } from './auth/router'
import { normalizeLoginOrEmail, normalizeValue } from './auth/authService'
import { toClientUserResponse } from './auth/userSerialization'
import { runtimeConfig } from './config/runtimeConfig'
import { requireAuth } from './middleware/requireAuth'
import { getRequestUserOrUnauthorized } from './middleware/requestUser'
import { sanitize } from './middleware/sanitize'
import { User } from './models/User'

const app = express()
const port = runtimeConfig.serverPort

function normalizeOrigin(origin: string): string | null {
  try {
    return new URL(origin).origin
  } catch (_error) {
    return null
  }
}

function hasDatabaseConfig(): boolean {
  return (
    Boolean(process.env.DATABASE_URL?.trim()) ||
    Boolean(
      process.env.POSTGRES_USER &&
        process.env.POSTGRES_PASSWORD &&
        process.env.POSTGRES_DB &&
        process.env.POSTGRES_PORT
    )
  )
}

type ProfileUpdateBody = {
  first_name?: unknown
  second_name?: unknown
  display_name?: unknown
  email?: unknown
  phone?: unknown
}

function parseAvatarUpload(req: Request): { avatar: string; avatarUrl: string } | null {
  const contentTypeHeader = req.headers['content-type']

  if (typeof contentTypeHeader !== 'string' || !Buffer.isBuffer(req.body)) {
    return null
  }

  const boundaryMatch = contentTypeHeader.match(/boundary=(?:"([^"]+)"|([^;]+))/i)
  const boundary = boundaryMatch?.[1] ?? boundaryMatch?.[2]

  if (!boundary) {
    return null
  }

  const parts = req.body.toString('latin1').split(`--${boundary}`)

  for (const part of parts) {
    if (!part.includes('name="avatar"')) {
      continue
    }

    const headersEndIndex = part.indexOf('\r\n\r\n')

    if (headersEndIndex === -1) {
      continue
    }

    const headers = part.slice(0, headersEndIndex)
    const content = part.slice(headersEndIndex + 4).replace(/\r\n$/, '')

    if (!content) {
      continue
    }

    const mimeType =
      headers.match(/Content-Type:\s*([^\r\n;]+)/i)?.[1]?.trim() || 'application/octet-stream'
    const fileName =
      headers.match(/filename="([^"]+)"/i)?.[1] ||
      headers.match(/filename\*=UTF-8''([^\r\n;]+)/i)?.[1] ||
      `avatar-${Date.now()}`
    const fileBuffer = Buffer.from(content, 'latin1')

    return {
      avatar: decodeURIComponent(fileName),
      avatarUrl: `data:${mimeType};base64,${fileBuffer.toString('base64')}`,
    }
  }

  return null
}

const corsAllowlist = new Set(
  [...runtimeConfig.corsAllowlist].map(value => normalizeOrigin(value)).filter(Boolean) as string[]
)
app.use((_req, res, next) => {
  res.append('Vary', 'Origin')
  next()
})
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }

      const normalized = normalizeOrigin(origin)
      if (normalized && corsAllowlist.has(normalized)) {
        callback(null, true)
        return
      }

      callback(new Error('CORS origin is not allowed'))
    },
  })
)
app.use(express.json())
app.use('/api', createAuthRouter())
app.use('/api/user/profile', requireAuth)

app.put('/api/user/profile', async (req: Request, res: Response) => {
  try {
    const currentUser = getRequestUserOrUnauthorized(req, res)
    if (!currentUser) return

    const body = (req.body ?? {}) as ProfileUpdateBody
    const nextValues: Partial<
      Pick<User, 'first_name' | 'second_name' | 'display_name' | 'email' | 'phone'>
    > = {}
    const fields = ['first_name', 'second_name', 'display_name', 'email', 'phone'] as const

    for (const field of fields) {
      const value = body[field]

      if (value === undefined) {
        continue
      }

      if (typeof value !== 'string') {
        return res.status(400).json({ reason: `Field "${field}" must be a string` })
      }

      if (field === 'email') {
        nextValues[field] = normalizeLoginOrEmail(value)
      } else {
        nextValues[field] = normalizeValue(value)
      }
    }

    if (nextValues.email && nextValues.email !== currentUser.email) {
      const existingByEmail = await User.findOne({ where: { email: nextValues.email } })

      if (existingByEmail && existingByEmail.id !== currentUser.id) {
        return res
          .status(409)
          .json({ reason: 'Пользователь с таким логином или email уже существует' })
      }
    }

    Object.assign(currentUser, nextValues)
    await currentUser.save()

    return res.json(toClientUserResponse(currentUser))
  } catch (error) {
    console.error('Failed to update profile:', error)
    return res.status(500).json({ reason: 'Internal Server Error' })
  }
})

app.put(
  '/api/user/profile/avatar',
  express.raw({ type: () => true, limit: '10mb' }),
  async (req: Request, res: Response) => {
    try {
      const currentUser = getRequestUserOrUnauthorized(req, res)
      if (!currentUser) return

      const uploadedAvatar = parseAvatarUpload(req)

      if (!uploadedAvatar) {
        return res.status(400).json({ reason: 'Avatar file is required' })
      }

      currentUser.avatar = uploadedAvatar.avatar
      currentUser.avatarUrl = uploadedAvatar.avatarUrl
      await currentUser.save()

      return res.json(toClientUserResponse(currentUser))
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      return res.status(500).json({ reason: 'Internal Server Error' })
    }
  }
)

app.delete('/api/user/profile/avatar', async (req: Request, res: Response) => {
  try {
    const currentUser = getRequestUserOrUnauthorized(req, res)
    if (!currentUser) return

    currentUser.avatar = null
    currentUser.avatarUrl = null
    await currentUser.save()

    return res.json(toClientUserResponse(currentUser))
  } catch (error) {
    console.error('Failed to remove avatar:', error)
    return res.status(500).json({ reason: 'Internal Server Error' })
  }
})

app.get('/', (_req: Request, res: Response) => {
  res.json('Server OK')
})

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof Error && error.message === 'CORS origin is not allowed') {
    return res.status(403).json({ reason: 'CORS origin is not allowed' })
  }

  return next(error)
})

const start = async () => {
  try {
    if (corsAllowlist.size === 0) {
      throw new Error('AUTH_CORS_ORIGIN_ALLOWLIST is required and must contain at least one origin')
    }

    if (!hasDatabaseConfig()) {
      throw new Error('DB config is required because auth and sessions are stored in PostgreSQL')
    }

    const { connectDB } = await import('./db')
    await connectDB()

    const { topicRouter } = await import('./routes/topicRouter')
    const { commentRouter } = await import('./routes/commentRouter')
    const { default: leaderboardRouter } = await import('./routes/leaderboardRouter')

    app.use('/api/forum/topics', requireAuth, sanitize, topicRouter)
    app.use('/api/forum/comments', requireAuth, sanitize, commentRouter)
    app.use('/api/leaderboard', requireAuth, sanitize, leaderboardRouter)

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
