import './loadEnv'
import 'reflect-metadata'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { createSession, destroySession, getUserIdFromSession } from './auth/session'
import { requireAuth } from './middleware/requireAuth'
import { sanitize } from './middleware/sanitize'

const app = express()
const port = Number(process.env.SERVER_PORT) || 3001

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)
app.use(express.json())

type StoredUser = {
  id: number
  first_name: string
  second_name: string
  display_name: string | null
  login: string
  email: string
  phone: string
  avatar: string | null
  avatarUrl: string | null
}

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
}

type ProfileUpdateBody = {
  first_name?: unknown
  second_name?: unknown
  display_name?: unknown
  email?: unknown
  phone?: unknown
}

const DEFAULT_USER_ID = 1
const YANDEX_SERVICE_ID = 'mock-yandex-service-id'

const users = new Map<number, StoredUser>([
  [
    DEFAULT_USER_ID,
    {
      id: DEFAULT_USER_ID,
      first_name: 'Степа',
      second_name: 'Степанов',
      display_name: 'Stepa',
      login: 'stepa',
      email: 'stepa@example.com',
      phone: '89000000000',
      avatar: null,
      avatarUrl: null,
    },
  ],
])

function sendUnauthorized(res: Response) {
  return res.status(401).json({ reason: 'Unauthorized' })
}

function sendUserNotFound(res: Response) {
  return res.status(404).json({ reason: 'User not found' })
}

function findUserByLogin(login: string): StoredUser | null {
  const normalizedLogin = login.trim().toLowerCase()

  for (const user of users.values()) {
    if (
      user.login.trim().toLowerCase() === normalizedLogin ||
      user.email.trim().toLowerCase() === normalizedLogin
    ) {
      return user
    }
  }

  return null
}

function hasUserConflict(login: string, email: string): boolean {
  const normalizedLogin = login.trim().toLowerCase()
  const normalizedEmail = email.trim().toLowerCase()

  for (const user of users.values()) {
    if (
      user.login.trim().toLowerCase() === normalizedLogin ||
      user.email.trim().toLowerCase() === normalizedEmail
    ) {
      return true
    }
  }

  return false
}

function getNextUserId(): number {
  let nextUserId = DEFAULT_USER_ID + 1

  while (users.has(nextUserId)) {
    nextUserId += 1
  }

  return nextUserId
}

function getStoredUserBySession(req: Request): StoredUser | null {
  const userId = getUserIdFromSession(req)

  if (userId === null) {
    return null
  }

  return users.get(userId) ?? null
}

function toAuthUserResponse(user: StoredUser) {
  return {
    id: user.id,
    first_name: user.first_name,
    second_name: user.second_name,
    display_name: user.display_name,
    login: user.login,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    avatarUrl: user.avatarUrl,
  }
}

function toClientUserResponse(user: StoredUser) {
  return {
    ...toAuthUserResponse(user),
    id: String(user.id),
    displayName: user.display_name ?? '',
    userName: user.login,
  }
}

function updateStoredUser(
  userId: number,
  updates: Partial<
    Pick<
      StoredUser,
      'first_name' | 'second_name' | 'display_name' | 'email' | 'phone' | 'avatar' | 'avatarUrl'
    >
  >
): StoredUser | null {
  const currentUser = users.get(userId)

  if (!currentUser) {
    return null
  }

  const updatedUser: StoredUser = {
    ...currentUser,
    ...updates,
  }

  users.set(userId, updatedUser)

  return updatedUser
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

app.post('/api/auth/signin', (req: Request, res: Response) => {
  const { login, password } = (req.body ?? {}) as SignInBody

  if (typeof login !== 'string' || typeof password !== 'string' || !login.trim() || !password) {
    return res.status(400).json({ reason: 'Логин и пароль обязательны' })
  }

  const user = findUserByLogin(login)

  if (!user) {
    return res.status(401).json({ reason: 'Неверный логин или пароль' })
  }

  createSession(res, user.id)

  return res.json(toClientUserResponse(user))
})

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { email, password, first_name, second_name, login, phone } = (req.body ?? {}) as SignUpBody

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

  const nextEmail = email.trim()
  const nextFirstName = first_name.trim()
  const nextSecondName = second_name.trim()
  const nextLogin = login.trim()
  const nextPhone = phone.trim()

  if (!nextEmail || !password || !nextFirstName || !nextSecondName || !nextLogin || !nextPhone) {
    return res.status(400).json({ reason: 'Все поля обязательны' })
  }

  if (hasUserConflict(nextLogin, nextEmail)) {
    return res.status(409).json({ reason: 'Пользователь с таким логином или email уже существует' })
  }

  const userId = getNextUserId()
  const newUser: StoredUser = {
    id: userId,
    first_name: nextFirstName,
    second_name: nextSecondName,
    display_name: null,
    login: nextLogin,
    email: nextEmail,
    phone: nextPhone,
    avatar: null,
    avatarUrl: null,
  }

  users.set(userId, newUser)
  createSession(res, userId)

  return res.json(toClientUserResponse(newUser))
})

app.post('/api/oauth/yandex', (req: Request, res: Response) => {
  const { code } = (req.body ?? {}) as OAuthBody

  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ reason: 'OAuth code is required' })
  }

  const user = users.get(DEFAULT_USER_ID)

  if (!user) {
    return sendUserNotFound(res)
  }

  createSession(res, user.id)

  return res.json(toClientUserResponse(user))
})

app.get('/api/oauth/yandex/service-id', (_req: Request, res: Response) => {
  return res.json({ service_id: YANDEX_SERVICE_ID })
})

app.get('/api/auth/user', (req: Request, res: Response) => {
  const userId = getUserIdFromSession(req)

  if (userId === null) {
    return sendUnauthorized(res)
  }

  const user = users.get(userId)

  if (!user) {
    return sendUserNotFound(res)
  }

  return res.json(toAuthUserResponse(user))
})

app.post('/api/auth/logout', (req: Request, res: Response) => {
  destroySession(req, res)
  res.sendStatus(200)
})

app.put('/api/user/profile', (req: Request, res: Response) => {
  const currentUser = getStoredUserBySession(req)

  if (!currentUser) {
    return getUserIdFromSession(req) === null ? sendUnauthorized(res) : sendUserNotFound(res)
  }

  const body = (req.body ?? {}) as ProfileUpdateBody
  const nextValues: Partial<
    Pick<StoredUser, 'first_name' | 'second_name' | 'display_name' | 'email' | 'phone'>
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

    nextValues[field] = value.trim()
  }

  const updatedUser = updateStoredUser(currentUser.id, nextValues)

  if (!updatedUser) {
    return sendUserNotFound(res)
  }

  return res.json(toClientUserResponse(updatedUser))
})

app.put(
  '/api/user/profile/avatar',
  express.raw({ type: () => true, limit: '10mb' }),
  (req: Request, res: Response) => {
    const currentUser = getStoredUserBySession(req)

    if (!currentUser) {
      return getUserIdFromSession(req) === null ? sendUnauthorized(res) : sendUserNotFound(res)
    }

    const uploadedAvatar = parseAvatarUpload(req)

    if (!uploadedAvatar) {
      return res.status(400).json({ reason: 'Avatar file is required' })
    }

    const updatedUser = updateStoredUser(currentUser.id, uploadedAvatar)

    if (!updatedUser) {
      return sendUserNotFound(res)
    }

    return res.json(toClientUserResponse(updatedUser))
  }
)

app.delete('/api/user/profile/avatar', (req: Request, res: Response) => {
  const currentUser = getStoredUserBySession(req)

  if (!currentUser) {
    return getUserIdFromSession(req) === null ? sendUnauthorized(res) : sendUserNotFound(res)
  }

  const updatedUser = updateStoredUser(currentUser.id, {
    avatar: null,
    avatarUrl: null,
  })

  if (!updatedUser) {
    return sendUserNotFound(res)
  }

  return res.json(toClientUserResponse(updatedUser))
})

app.get('/', (_req: Request, res: Response) => {
  res.json('Server OK')
})

const start = async () => {
  try {
    const { topicRouter } = await import('./routes/topicRouter')
    const { commentRouter } = await import('./routes/commentRouter')
    const { default: leaderboardRouter } = await import('./routes/leaderboardRouter')

    app.use('/api/forum/topics', requireAuth, sanitize, topicRouter)
    app.use('/api/forum/comments', requireAuth, sanitize, commentRouter)
    app.use('/api/leaderboard', requireAuth, sanitize, leaderboardRouter)

    // eslint-disable-next-line no-constant-condition
    if (false) {
      const { connectDB } = await import('./db')
      await connectDB()
    }

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
