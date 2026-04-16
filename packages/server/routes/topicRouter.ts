import { Router, Request, Response } from 'express'
import { Topic } from '../models/Topic'
import { Comment } from '../models/Comment'
import { sanitize } from '../middleware/sanitize'

export const topicRouter = Router()

topicRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const topics = await Topic.findAll()
    res.json(topics)
  } catch (err) {
    console.error('Failed to fetch topics:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

topicRouter.post('/', sanitize, async (req: Request, res: Response) => {
  try {
    const { title, description, author_id } = req.body

    if (!title || !author_id) {
      res.status(400).json({ error: 'Title and author_id are required' })
      return
    }

    const topic = await Topic.create({
      title,
      description: description || '',
      author_id,
    })
    res.status(201).json(topic)
  } catch (err) {
    console.error('Failed to create topic:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

topicRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByPk(req.params.id, {
      include: [{ model: Comment, as: 'comments' }],
    })
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' })
      return
    }
    res.json(topic)
  } catch (err) {
    console.error('Failed to fetch topic:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

topicRouter.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const comments = await Comment.findAll({
      where: { topic_id: req.params.id, parentId: null },
      include: [
        { model: Comment, as: 'replies', include: [{ all: true, nested: true }] },
        { all: true },
      ],
    })
    res.json(comments)
  } catch (err) {
    console.error('Failed to fetch comments:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

topicRouter.post('/:id/comments', sanitize, async (req: Request, res: Response) => {
  try {
    const { content, author_id, parentId } = req.body

    if (!content || !author_id) {
      res.status(400).json({ error: 'Content and author_id are required' })
      return
    }

    const comment = await Comment.create({
      content,
      author_id,
      topic_id: Number(req.params.id),
      parentId: parentId || null,
    })
    res.status(201).json(comment)
  } catch (err) {
    console.error('Failed to create comment:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
