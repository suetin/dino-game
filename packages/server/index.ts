import './loadEnv'
import 'reflect-metadata'
import express, { Request, Response } from 'express'
import cors from 'cors'
const app = express()
const port = Number(process.env.SERVER_PORT) || 3001
const skipDB = process.env.SKIP_DB === 'true'
app.use(cors())
app.use(express.json())
app.get('/friends', (_req: Request, res: Response) => {
  res.json([
    { name: 'Саша', secondName: 'Панов' },
    { name: 'Лёша', secondName: 'Садовников' },
    { name: 'Серёжа', secondName: 'Иванов' },
  ])
})
app.get('/user', (_req: Request, res: Response) => {
  res.json({ name: 'Степа', secondName: 'Степанов' })
})
app.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' })
  }
  return res.json({ name: 'Степа', secondName: 'Степанов' })
})
app.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, name, secondName } = req.body || {}
  if (!email || !password || !name || !secondName) {
    return res.status(400).json({ message: 'Заполните все поля: email, пароль, имя, фамилия' })
  }
  return res.status(201).json({ name: String(name).trim(), secondName: String(secondName).trim() })
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
