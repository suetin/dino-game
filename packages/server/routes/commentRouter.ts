import { Router, Request, Response } from 'express'
import { Comment } from '../models/Comment'
import { Reaction } from '../models/Reaction'
import { sanitize } from '../middleware/sanitize'
import { extractUserId, isAllowedReactionEmoji, summarizeReactions } from '../lib/reactions'

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

commentRouter.post('/:id/replies', sanitize, async (req: Request, res: Response) => {
  try {
    const { content, author_id, topic_id } = req.body

    if (!content || !author_id || !topic_id) {
      res.status(400).json({ error: 'Content, author_id and topic_id are required' })
      return
    }

    const reply = await Comment.create({
      content,
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
    const commentId = Number(req.params.id)
    if (!Number.isInteger(commentId) || commentId <= 0) {
      res.status(400).json({ error: 'Invalid comment id' })
      return
    }
    const currentUserId = extractUserId(req)
    const comment = await Comment.findByPk(commentId)

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' })
      return
    }

    const reactions = await Reaction.findAll({
      where: { comment_id: commentId },
    })

    const { reactionSummary, myReactions } = summarizeReactions(
      reactions.map(reaction => ({
        emoji: reaction.emoji,
        user_id: reaction.user_id,
      })),
      currentUserId
    )

    res.json({
      comment_id: commentId,
      reactionSummary,
      myReactions,
    })
  } catch (err) {
    console.error('Failed to fetch reactions:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

commentRouter.post('/:id/reactions', sanitize, async (req: Request, res: Response) => {
  try {
    const commentId = Number(req.params.id)
    if (!Number.isInteger(commentId) || commentId <= 0) {
      res.status(400).json({ error: 'Invalid comment id' })
      return
    }
    const { emoji } = req.body
    const userId = extractUserId(req)

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!emoji || typeof emoji !== 'string') {
      res.status(400).json({ error: 'Emoji is required' })
      return
    }

    if (!isAllowedReactionEmoji(emoji)) {
      res.status(400).json({ error: 'Emoji is not allowed' })
      return
    }

    const comment = await Comment.findByPk(commentId)

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' })
      return
    }

    const existingReaction = await Reaction.findOne({
      where: {
        emoji,
        user_id: userId,
        comment_id: commentId,
      },
    })

    let status: 'added' | 'removed' = 'added'

    if (existingReaction) {
      await existingReaction.destroy()
      status = 'removed'
    } else {
      await Reaction.create({
        emoji,
        user_id: userId,
        comment_id: commentId,
      })
    }

    const reactions = await Reaction.findAll({
      where: { comment_id: commentId },
    })

    const { reactionSummary, myReactions } = summarizeReactions(
      reactions.map(reaction => ({
        emoji: reaction.emoji,
        user_id: reaction.user_id,
      })),
      userId
    )

    res.status(200).json({
      status,
      comment_id: commentId,
      reactionSummary,
      myReactions,
    })
  } catch (err) {
    console.error('Failed to add reaction:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
