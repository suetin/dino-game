import './loadEnv'
import 'reflect-metadata'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { createSession, destroySession } from './auth/session'
import { requireAuth } from './middleware/requireAuth'

const app = express()
const port = Number(process.env.SERVER_PORT) || 3001
const skipDB = process.env.SKIP_DB === 'true'

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)
app.use(express.json())

const MOCK_USER = {
  id: '1',
  name: 'Степа',
  secondName: 'Степанов',
  displayName: 'Stepa',
  login: 'stepa',
  email: 'stepa@example.com',
  phone: '89000000000',
  avatarUrl: null as string | null,
}

app.get('/friends', (_req: Request, res: Response) => {
  res.json([
    { name: 'Саша', secondName: 'Панов' },
    { name: 'Лёша', secondName: 'Садовников' },
    { name: 'Серёжа', secondName: 'Иванов' },
  ])
})

app.get('/user', (_req: Request, res: Response) => {
  res.json(MOCK_USER)
})

app.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' })
  }
  createSession(res)
  return res.json(MOCK_USER)
})
app.post('/api/auth/signin', (req: Request, res: Response) => {
  const { login, password } = req.body || {}
  if (!login || !password) {
    return res.status(400).json({ reason: 'Логин и пароль обязательны' })
  }
  createSession(res)
  return res.json(MOCK_USER)
})

app.get('/api/auth/user', (_req: Request, res: Response) => {
  res.json(MOCK_USER)
})

app.get('/api/oauth/yandex/service-id', (_req: Request, res: Response) => {
  res.json({ service_id: 'e6fbef6d71bb475289408b575a0bf8b0' })
})

app.post('/api/oauth/yandex', (req: Request, res: Response) => {
  const { code, redirect_uri } = req.body || {}

  if (!code || !redirect_uri) {
    return res.status(400).json({ reason: 'code and redirect_uri are required' })
  }

  createSession(res)
  return res.status(200).json({ ok: true })
})

app.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, name, secondName } = req.body || {}
  if (!email || !password || !name || !secondName) {
    return res.status(400).json({ message: 'Заполните все поля: email, пароль, имя, фамилия' })
  }
  createSession(res)
  return res.status(201).json({ ...MOCK_USER, name, secondName, email })
})
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { email, password, first_name, second_name, login, phone } = req.body || {}
  if (!email || !password || !first_name || !second_name || !login || !phone) {
    return res.status(400).json({ reason: 'Заполните все обязательные поля' })
  }
  createSession(res)
  return res.status(200).json({ id: 1 })
})
app.post('/api/auth/logout', (req: Request, res: Response) => {
  destroySession(req, res)
  res.sendStatus(200)
})

app.put('/api/user/profile', (req: Request, res: Response) => {
  const data = req.body
  return res.json({ ...MOCK_USER, ...data })
})

app.put('/api/user/profile/avatar', (_req: Request, res: Response) => {
  return res.json({ ...MOCK_USER, avatarUrl: '/path/to/avatar.jpg' })
})

app.delete('/api/user/profile/avatar', (_req: Request, res: Response) => {
  return res.json({ ...MOCK_USER, avatarUrl: null })
})

app.get('/', (_req: Request, res: Response) => {
  res.json('Howdy from the server :)')
})

const start = async () => {
  try {
    if (!skipDB) {
      const { connectDB } = await import('./db')
      const { topicRouter } = await import('./routes/topicRouter')
      const { commentRouter } = await import('./routes/commentRouter')

      app.use('/api/forum/topics', requireAuth, topicRouter)
      app.use('/api/forum/comments', requireAuth, commentRouter)

      await connectDB()
    }

    app.listen(port)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
