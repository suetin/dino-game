import { Router, Request, Response } from 'express'
import { sanitize } from '../middleware/sanitize'

type LeaderboardEntryData = {
  name: string
  score: number
}

type LeaderboardEntry = {
  id: number
  data: LeaderboardEntryData
  createdAt: string
  updatedAt: string
}

type AddLeaderboardBody = {
  data?: Partial<LeaderboardEntryData>
  ratingFieldName?: string
}

type GetLeaderboardBody = {
  ratingFieldName?: string
  cursor?: number
  limit?: number
}

const leaderboardRouter = Router()

const RATING_FIELD_NAME = 'score'

const leaderboardStore: LeaderboardEntry[] = [
  {
    id: 1,
    data: { name: 'Alice', score: 420 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    data: { name: 'Bob', score: 390 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    data: { name: 'Charlie', score: 370 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    data: { name: 'Diana', score: 350 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    data: { name: 'Ethan', score: 330 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    data: { name: 'Fiona', score: 310 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    data: { name: 'George', score: 295 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 8,
    data: { name: 'Hannah', score: 270 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 9,
    data: { name: 'Ivan', score: 250 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 10,
    data: { name: 'Julia', score: 230 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    id: 11,
    data: { name: 'Kevin', score: 210 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 12,
    data: { name: 'Laura', score: 200 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 13,
    data: { name: 'Mike', score: 185 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 14,
    data: { name: 'Nina', score: 170 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 15,
    data: { name: 'Oscar', score: 155 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 16,
    data: { name: 'Paula', score: 140 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 17,
    data: { name: 'Quentin', score: 125 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 18,
    data: { name: 'Rachel', score: 110 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 19,
    data: { name: 'Steve', score: 95 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 20,
    data: { name: 'Tina', score: 80 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let nextId = leaderboardStore.length + 1

leaderboardRouter.post(
  '/',
  sanitize,
  (req: Request<unknown, unknown, AddLeaderboardBody>, res: Response) => {
    const { data, ratingFieldName } = req.body

    if (ratingFieldName !== RATING_FIELD_NAME) {
      return res.status(400).json({
        reason: `ratingFieldName must be "${RATING_FIELD_NAME}"`,
      })
    }

    if (!data?.name || typeof data.name !== 'string') {
      return res.status(400).json({
        reason: 'data.name is required',
      })
    }

    if (typeof data.score !== 'number' || Number.isNaN(data.score)) {
      return res.status(400).json({
        reason: 'data.score must be a number',
      })
    }

    const normalizedName = data.name.trim()
    const now = new Date().toISOString()

    const existingEntry = leaderboardStore.find(
      entry => entry.data.name.toLowerCase() === normalizedName.toLowerCase()
    )

    if (existingEntry) {
      if (data.score > existingEntry.data.score) {
        existingEntry.data.score = data.score
        existingEntry.updatedAt = now
      }

      return res.json({
        success: true,
        data: existingEntry,
      })
    }

    const newEntry: LeaderboardEntry = {
      id: nextId++,
      data: {
        name: normalizedName,
        score: data.score,
      },
      createdAt: now,
      updatedAt: now,
    }

    leaderboardStore.push(newEntry)

    return res.json({
      success: true,
      data: newEntry,
    })
  }
)

leaderboardRouter.post(
  '/all',
  sanitize,
  (req: Request<unknown, unknown, GetLeaderboardBody>, res: Response) => {
    const { ratingFieldName, cursor = 0, limit = 10 } = req.body

    if (ratingFieldName !== RATING_FIELD_NAME) {
      return res.status(400).json({
        reason: `ratingFieldName must be "${RATING_FIELD_NAME}"`,
      })
    }

    const safeCursor = Number.isInteger(cursor) && cursor >= 0 ? cursor : 0
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10

    const sorted = [...leaderboardStore].sort((a, b) => b.data.score - a.data.score)

    const items = sorted.slice(safeCursor, safeCursor + safeLimit)
    const nextCursor = safeCursor + safeLimit < sorted.length ? safeCursor + safeLimit : null

    return res.json({
      data: items,
      cursor: nextCursor,
      total: sorted.length,
    })
  }
)

export default leaderboardRouter
