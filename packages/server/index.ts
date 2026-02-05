import 'reflect-metadata'
import dotenv from 'dotenv'
import cors from 'cors'
import express, { Request, Response } from 'express'
import { createClientAndConnect } from './db'
import { Topic } from './models/Topic'
import { Comment } from './models/Comment'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const port = Number(process.env.SERVER_PORT) || 3001

// --- Роуты Форума ---

// 1. Получить все темы
app.get('/api/forum/topics', async (_req: Request, res: Response) => {
  try {
    const topics = await Topic.findAll()
    return res.json(topics)
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// 2. Создать тему
app.post('/api/forum/topics', async (req: Request, res: Response) => {
  try {
    const { title, description, author_id } = req.body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res
        .status(400)
        .json({ error: 'Заголовок (title) обязателен и не может быть пустым' })
    }

    if (!author_id || typeof author_id !== 'number') {
      return res
        .status(400)
        .json({ error: 'ID автора (author_id) должен быть числом' })
    }

    const newTopic = await Topic.create({ title, description, author_id })
    return res.status(201).json(newTopic)
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка при создании темы' })
  }
})

// 3. Получить одну тему со всеми комментариями
app.get('/api/forum/topics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const topic = await Topic.findByPk(id, {
      include: [
        {
          model: Comment,
          where: { parentId: null }, // Берем только "корневые" комментарии
          required: false,
          include: [
            {
              model: Comment,
              as: 'replies', // И подтягиваем к ним ответы
            },
          ],
        },
      ],
    })

    if (!topic) {
      return res.status(404).json({ error: 'Тема не найдена' })
    }

    return res.json(topic)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// 4. Оставить комментарий
app.post('/api/forum/comments', async (req: Request, res: Response) => {
  try {
    const { content, topic_id, author_id, parentId } = req.body

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Комментарий не может быть пустым' })
    }

    if (!topic_id || !author_id) {
      return res.status(400).json({ error: 'topic_id и author_id обязательны' })
    }

    const comment = await Comment.create({
      content,
      topic_id,
      author_id,
      parentId,
    })
    return res.status(201).json(comment)
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка при создании комментария' })
  }
})

// 5. Редактировать тему
app.put('/api/forum/topics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description } = req.body

    if (title !== undefined && title.trim().length === 0) {
      return res
        .status(400)
        .json({ error: 'Новый заголовок не может быть пустым' })
    }

    const [updatedCount] = await Topic.update(
      { title, description },
      { where: { id } }
    )

    if (updatedCount === 0)
      return res.status(404).json({ error: 'Тема не найдена' })
    return res.json({ message: 'Тема обновлена' })
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка при обновлении' })
  }
})

// 6. Удалить тему
app.delete('/api/forum/topics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deletedCount = await Topic.destroy({ where: { id } })

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Тема не найдена' })
    }

    return res
      .status(200)
      .json({ message: 'Тема и все её комментарии удалены' })
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка при удалении' })
  }
})

// 7. Редактировать комментарий
app.put('/api/forum/comments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { content } = req.body

    const [updatedCount] = await Comment.update({ content }, { where: { id } })

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Комментарий не найден' })
    }

    return res.json({ message: 'Комментарий изменен' })
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка при редактировании' })
  }
})

// --- Заглушки ---

app.get('/friends', (_, res) => {
  res.json([
    { name: 'Саша', secondName: 'Панов' },
    { name: 'Лёша', secondName: 'Садовников' },
    { name: 'Серёжа', secondName: 'Иванов' },
  ])
})

app.get('/user', (_req: Request, res: Response) => {
  res.json({
    name: 'Степа',
    secondName: 'Степанов',
  })
})

app.get('/', (_, res) => {
  res.json('👋 Howdy from the server :)')
})

// --- ГЛАВНОЕ ИСПРАВЛЕНИЕ: Безопасный запуск ---

async function start() {
  try {
    // Ждем инициализации базы данных перед тем, как открыть порт
    await createClientAndConnect()

    app.listen(port, () => {
      console.log(`  ➜ 🎸 Server is listening on port: ${port}`)
    })
  } catch (error) {
    console.error('❌ Не удалось запустить приложение:', error)
    process.exit(1) // Останавливаем выполнение при критической ошибке
  }
}

start()
