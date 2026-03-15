import { Router, Request, Response } from 'express'

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

export const leaderboardRouter = Router()

const RATING_FIELD_NAME = 'score'

const leaderboardStore: LeaderboardEntry[] = [
  {
    id: 1,
    data: { name: 'Alice', score: 120 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    data: { name: 'Bob', score: 95 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    data: { name: 'Charlie', score: 150 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let nextId = leaderboardStore.length + 1

leaderboardRouter.post('/', (req: Request<unknown, unknown, AddLeaderboardBody>, res: Response) => {
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
})

leaderboardRouter.post(
  '/all',
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
