import type { Request } from 'express'
import { getUserIdFromSession } from '../auth/session'

export const ALLOWED_REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢', '👎'] as const

export type ReactionSummaryItem = {
  emoji: string
  count: number
}

export function isAllowedReactionEmoji(emoji: string): boolean {
  return ALLOWED_REACTION_EMOJIS.includes(emoji as (typeof ALLOWED_REACTION_EMOJIS)[number])
}

export function extractUserId(req: Request): number | null {
  const sessionUserId = getUserIdFromSession(req)

  if (sessionUserId !== null) {
    return sessionUserId
  }

  const headerUserId = req.headers['x-auth-user-id']

  if (typeof headerUserId === 'string') {
    const parsed = Number(headerUserId)
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

export function summarizeReactions(
  reactions: Array<{ emoji: string; user_id: number }>,
  currentUserId: number | null
): { reactionSummary: ReactionSummaryItem[]; myReactions: string[] } {
  const counts = new Map<string, number>()
  const myReactionsSet = new Set<string>()

  for (const reaction of reactions) {
    counts.set(reaction.emoji, (counts.get(reaction.emoji) || 0) + 1)

    if (currentUserId !== null && reaction.user_id === currentUserId) {
      myReactionsSet.add(reaction.emoji)
    }
  }

  const reactionSummary = ALLOWED_REACTION_EMOJIS.map(emoji => ({
    emoji,
    count: counts.get(emoji) || 0,
  })).filter(item => item.count > 0)

  const myReactions = ALLOWED_REACTION_EMOJIS.filter(emoji => myReactionsSet.has(emoji))

  return { reactionSummary, myReactions }
}
