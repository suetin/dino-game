import './loadEnv'
import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db'
import { topicRouter } from './routes/topicRouter'
import { commentRouter } from './routes/commentRouter'

const app = express()
const port = Number(process.env.SERVER_PORT) || 3001

app.use(cors())
app.use(express.json())

app.use('/api/forum/topics', topicRouter)
app.use('/api/forum/comments', commentRouter)

app.get('/', (_, res) => {
  res.json('Howdy from the server :)')
})

const start = async () => {
  try {
    await connectDB()
    console.log('  ➜ Database connected')

    app.listen(port, () => {
      console.log(`  ➜  Server is listening on port: ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
