import 'reflect-metadata'
import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import cors from 'cors'

import { connectDB } from './db'
import { topicRouter } from './routes/topicRouter'
import { commentRouter } from './routes/commentRouter'

dotenv.config()

const app = express()
const port = Number(process.env.SERVER_PORT) || 3001

app.use(cors())
app.use(express.json())

app.use('/api/forum/topics', topicRouter)
app.use('/api/forum/comments', commentRouter)

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'Forum API is working' })
})

const start = async () => {
  try {
    await connectDB()

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
