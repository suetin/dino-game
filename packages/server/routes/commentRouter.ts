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
    res.status(500).json({ error: 'Failed to fetch comment' })
  }
})

commentRouter.post('/:id/replies', async (req: Request, res: Response) => {
  try {
    const { content, author_id, topic_id } = req.body
    const reply = await Comment.create({
      content,
      author_id,
      topic_id,
      parentId: Number(req.params.id),
    })
    res.json(reply)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reply' })
  }
})

commentRouter.get('/:id/reactions', async (req: Request, res: Response) => {
  try {
    const reactions = await Reaction.findAll({
      where: { comment_id: req.params.id },
    })
    res.json(reactions)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reactions' })
  }
})

commentRouter.post('/:id/reactions', async (req: Request, res: Response) => {
  try {
    const { emoji, user_id } = req.body
    const reaction = await Reaction.create({
      emoji,
      user_id,
      comment_id: Number(req.params.id),
    })
    res.json(reaction)
  } catch (err) {
    res.status(500).json({ error: 'Failed to add reaction' })
  }
})
