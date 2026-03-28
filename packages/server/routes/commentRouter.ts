import { Router, Request, Response } from 'express'
import { Comment } from '../models/Comment'
import { Reaction } from '../models/Reaction'

export const commentRouter = Router()

commentRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findByPk(req.params.id, {
      include: [{ all: true, nested: true }],
    })
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' })
      return
    }
    res.json(comment)
  } catch (err) {
    console.error('Failed to fetch comment:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

commentRouter.post('/:id/replies', async (req: Request, res: Response) => {
  try {
    const { content, author_id, topic_id } = req.body

    if (!content || !author_id || !topic_id) {
      res.status(400).json({ error: 'Content, author_id and topic_id are required' })
      return
    }

    const sanitizedContent = String(content)
      .replace(/<[^>]*>?/gm, '')
      .trim()

    const reply = await Comment.create({
      content: sanitizedContent,
      author_id,
      topic_id,
      parentId: Number(req.params.id),
    })
    res.status(201).json(reply)
  } catch (err) {
    console.error('Failed to create reply:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

commentRouter.get('/:id/reactions', async (req: Request, res: Response) => {
  try {
    const reactions = await Reaction.findAll({
      where: { comment_id: req.params.id },
    })
    res.json(reactions)
  } catch (err) {
    console.error('Failed to fetch reactions:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

commentRouter.post('/:id/reactions', async (req: Request, res: Response) => {
  try {
    const { emoji, user_id } = req.body

    if (!emoji || !user_id) {
      res.status(400).json({ error: 'Emoji and user_id are required' })
      return
    }

    const sanitizedEmoji = String(emoji)
      .replace(/<[^>]*>?/gm, '')
      .trim()

    const reaction = await Reaction.create({
      emoji: sanitizedEmoji,
      user_id,
      comment_id: Number(req.params.id),
    })
    res.status(201).json(reaction)
  } catch (err) {
    console.error('Failed to add reaction:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
