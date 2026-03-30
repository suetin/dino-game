import './loadEnv'
import 'reflect-metadata'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { connectDB } from './db'
import { topicRouter } from './routes/topicRouter'
import { commentRouter } from './routes/commentRouter'

const app = express()
const port = Number(process.env.SERVER_PORT) || 3001

app.use(cors())
app.use(express.json())

// --- MOCK DATA & ENDPOINTS (Восстановлено для сохранения обратной совместимости) ---

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
  return res.json(MOCK_USER)
})

app.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, name, secondName } = req.body || {}
  if (!email || !password || !name || !secondName) {
    return res.status(400).json({ message: 'Заполните все поля: email, пароль, имя, фамилия' })
  }
  return res.status(201).json({ ...MOCK_USER, name, secondName, email })
})

app.post('/auth/logout', (_req: Request, res: Response) => {
  res.sendStatus(200)
})

app.put('/user/profile', (req: Request, res: Response) => {
  const data = req.body
  return res.json({ ...MOCK_USER, ...data })
})

app.put('/user/profile/avatar', (_req: Request, res: Response) => {
  return res.json({ ...MOCK_USER, avatarUrl: '/path/to/avatar.jpg' })
})

app.delete('/user/profile/avatar', (_req: Request, res: Response) => {
  return res.json({ ...MOCK_USER, avatarUrl: null })
})

// --- FORUM API ---

app.use('/api/forum/topics', topicRouter)
app.use('/api/forum/comments', commentRouter)

app.get('/', (_req: Request, res: Response) => {
  res.json('Howdy from the server :)')
})

const start = async () => {
  try {
    await connectDB()
    console.log('  ➜ Database connected')

    app.listen(port, () => {
      console.log(`[server] Слушаю порт ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
