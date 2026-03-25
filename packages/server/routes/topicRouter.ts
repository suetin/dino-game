import { Router, Request, Response } from 'express'
import { Topic } from '../models/Topic'
import { Comment } from '../models/Comment'

export const topicRouter = Router()

topicRouter.get('/', async (req: Request, res: Response) => {
  try {
    const topics = await Topic.findAll()
    res.json(topics)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' })
  }
})

topicRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, author_id } = req.body
    const topic = await Topic.create({ title, description, author_id })
    res.json(topic)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create topic' })
  }
})

topicRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByPk(req.params.id, {
      include: [Comment],
    })
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' })
      return
    }
    res.json(topic)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topic' })
  }
})

topicRouter.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const comments = await Comment.findAll({
      where: { topic_id: req.params.id, parentId: null },
      include: [{ all: true, nested: true }],
    })
    res.json(comments)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

topicRouter.post('/:id/comments', async (req: Request, res: Response) => {
  try {
    const { content, author_id, parentId } = req.body
    const comment = await Comment.create({
      content,
      author_id,
      topic_id: Number(req.params.id),
      parentId: parentId || null,
    })
    res.json(comment)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment' })
  }
})
