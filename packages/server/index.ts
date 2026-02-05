import 'reflect-metadata'
import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import { createClientAndConnect } from './db'

import { topicRouter } from './routes/topicRouter'
import { commentRouter } from './routes/commentRouter'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json()) // Чтобы сервер понимал JSON в POST запросах

const port = Number(process.env.SERVER_PORT) || 3001

// Подключаем API пути
app.use('/api/forum/topics', topicRouter)
app.use('/api/forum/comments', commentRouter)

// Простая проверка сервера
app.get('/', (_, res) => {
  res.json('👋 Forum API is working!')
})

// Безопасный запуск после подключения к БД
async function start() {
  try {
    await createClientAndConnect()
    app.listen(port, () => {
      console.log(`  ➜ 🎸 Server is listening on port: ${port}`)
    })
  } catch (error) {
    console.error('❌ Ошибка запуска:', error)
    process.exit(1)
  }
}

start()
