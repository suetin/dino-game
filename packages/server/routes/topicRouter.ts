import { Router, Request, Response } from 'express'
import { Topic } from '../models/Topic'
import { Comment } from '../models/Comment'

export const topicRouter = Router()

// GET /api/forum/topics - Получить все темы
topicRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const topics = await Topic.findAll()
    return res.json(topics)
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// POST /api/forum/topics - Создать тему
topicRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, author_id } = req.body
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Заголовок обязателен' })
    }
    const newTopic = await Topic.create({ title, description, author_id })
    return res.status(201).json(newTopic)
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка при создании темы' })
  }
})

// GET /api/forum/topics/:id - Одна тема + комменты
topicRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByPk(req.params.id, {
      include: [
        {
          model: Comment,
          where: { parentId: null },
          required: false,
          include: [{ model: Comment, as: 'replies' }],
        },
      ],
    })
    if (!topic) return res.status(404).json({ error: 'Тема не найдена' })
    return res.json(topic)
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// PUT /api/forum/topics/:id - Обновить
topicRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const [updatedCount] = await Topic.update(req.body, {
      where: { id: req.params.id },
    })
    if (updatedCount === 0)
      return res.status(404).json({ error: 'Тема не найдена' })
    return res.json({ message: 'Тема обновлена' })
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка при обновлении' })
  }
})

// DELETE /api/forum/topics/:id - Удалить
topicRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedCount = await Topic.destroy({ where: { id: req.params.id } })
    if (deletedCount === 0)
      return res.status(404).json({ error: 'Тема не найдена' })
    return res.json({ message: 'Тема удалена' })
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка при удалении' })
  }
})
