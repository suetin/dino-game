import './loadEnv'
import 'reflect-metadata'
import express, { Request, Response } from 'express'
import cors from 'cors'
const app = express()
const port = Number(process.env.SERVER_PORT) || 3001
const skipDB = process.env.SKIP_DB === 'true'
app.use(cors())
app.use(express.json())

// MOCK DATA
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

// Profile Update (Mock)
app.put('/user/profile', (req: Request, res: Response) => {
  const data = req.body
  // В реальности тут был бы апдейт базы
  return res.json({ ...MOCK_USER, ...data })
})

// Avatar Update (Mock - без реальной загрузки файла пока)
app.put('/user/profile/avatar', (_req: Request, res: Response) => {
  // Тут должна быть обработка FormData
  // Возвращаем заглушку
  return res.json({ ...MOCK_USER, avatarUrl: '/path/to/avatar.jpg' })
})

app.delete('/user/profile/avatar', (_req: Request, res: Response) => {
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
      app.use('/api/forum/topics', topicRouter)
      app.use('/api/forum/comments', commentRouter)
      await connectDB()
      console.log('  ➜ Database connected')
    } else {
      console.log('  ➜ Running without database (SKIP_DB=true)')
    }
    app.listen(port, () => {
      console.log(`  ➜  Server is listening on port: ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}
start()
