import type { Request, Response } from 'express'
import { Comment } from '../models/Comment'

export const CommentController = {
  // Создание комментария
  create: async (req: Request, res: Response) => {
    try {
      const { content, topic_id, author_id, parentId } = req.body

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Контент комментария обязателен' })
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
  },

  // Обновление комментария
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { content } = req.body

      const [updatedCount] = await Comment.update(
        { content },
        { where: { id } }
      )

      if (updatedCount === 0) {
        return res.status(404).json({ error: 'Комментарий не найден' })
      }

      return res.json({ message: 'Комментарий обновлен' })
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка при обновлении' })
    }
  },

  // Удаление комментария
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const deletedCount = await Comment.destroy({
        where: { id },
      })

      if (deletedCount === 0) {
        return res
          .status(403)
          .json({ error: 'Доступ запрещен или комментарий не найден' })
      }

      return res.json({ message: 'Комментарий удален' })
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка при удалении' })
    }
  },
}
