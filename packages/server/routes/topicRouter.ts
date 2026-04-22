import { Router, Request, Response } from 'express'
import { Topic } from '../models/Topic'
import { Comment } from '../models/Comment'
import { Reaction } from '../models/Reaction'
import { sanitize } from '../middleware/sanitize'
import { extractUserId, summarizeReactions } from '../lib/reactions'

export const topicRouter = Router()

type CommentWithRelations = {
  id: number
  content: string
  author_id: string
  topic_id: number
  parentId: number | null
  createdAt: string
  updatedAt: string
  reactions?: Array<{ emoji: string; user_id: number }>
  replies?: CommentWithRelations[]
}

type CommentWithReactionSummary = Omit<CommentWithRelations, 'reactions' | 'replies'> & {
  reactionSummary: Array<{ emoji: string; count: number }>
  myReactions: string[]
  replies: CommentWithReactionSummary[]
}

function withReactionSummary(
  comment: CommentWithRelations,
  currentUserId: number | null
): CommentWithReactionSummary {
  const { reactions: rawReactions, replies: rawReplies, ...rest } = comment
  const reactions = Array.isArray(rawReactions) ? rawReactions : []
  const replies = Array.isArray(rawReplies) ? rawReplies : []
  const { reactionSummary, myReactions } = summarizeReactions(reactions, currentUserId)

  return {
    ...rest,
    reactionSummary,
    myReactions,
    replies: replies.map(reply => withReactionSummary(reply, currentUserId)),
  }
}

function buildCommentTree(comments: CommentWithRelations[]): CommentWithRelations[] {
  const byId = new Map<number, CommentWithRelations>()
  const roots: CommentWithRelations[] = []

  for (const comment of comments) {
    byId.set(comment.id, {
      ...comment,
      replies: [],
    })
  }

  for (const comment of byId.values()) {
    const parentId = comment.parentId

    if (parentId === null) {
      roots.push(comment)
      continue
    }

    const parent = byId.get(parentId)

    if (parent) {
      parent.replies = [...(parent.replies || []), comment]
    } else {
      roots.push(comment)
    }
  }

  return roots
}

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
    const currentUserId = extractUserId(req)
    const topicId = Number(req.params.id)

    if (!Number.isInteger(topicId) || topicId <= 0) {
      res.status(400).json({ error: 'Invalid topic id' })
      return
    }

    const comments = await Comment.findAll({
      where: { topic_id: topicId },
      include: [{ model: Reaction, attributes: ['emoji', 'user_id'] }],
      order: [['createdAt', 'ASC']],
    })

    const tree = buildCommentTree(comments.map(comment => comment.toJSON() as CommentWithRelations))

    res.json(tree.map(comment => withReactionSummary(comment, currentUserId)))
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
