import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { SERVER_HOST } from '@/constants'

export const LEADERBOARD_RATING_FIELD_NAME = 'score'
export const LEADERBOARD_BEST_SCORE_KEY = 'dino_best_score'

type RequestStatus = 'idle' | 'pending' | 'success' | 'error'

export type LeaderboardEntry = {
  id: number
  data: {
    name: string
    score: number
  }
  createdAt: string
  updatedAt: string
}

type SubmitLeaderboardPayload = {
  name: string
  score: number
}

type FetchLeaderboardPayload = {
  cursor?: number
  limit?: number
  append?: boolean
}

type FetchLeaderboardResponse = {
  data: LeaderboardEntry[]
  cursor: number | null
  total: number
}

export interface LeaderboardState {
  entries: LeaderboardEntry[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  cursor: number | null
  total: number
  fetchStatus: RequestStatus
  submitStatus: RequestStatus
}

const initialState: LeaderboardState = {
  entries: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  cursor: 0,
  total: 0,
  fetchStatus: 'idle',
  submitStatus: 'idle',
}

function getBestScoreFromStorage() {
  if (typeof window === 'undefined') return 0

  const raw = window.localStorage.getItem(LEADERBOARD_BEST_SCORE_KEY)
  const parsed = Number(raw)

  return Number.isFinite(parsed) ? parsed : 0
}

function setBestScoreToStorage(score: number) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LEADERBOARD_BEST_SCORE_KEY, String(score))
}

export const submitLeaderboardResultThunk = createAsyncThunk<
  LeaderboardEntry | null,
  SubmitLeaderboardPayload
>('leaderboard/submitLeaderboardResultThunk', async payload => {
  const bestScore = getBestScoreFromStorage()

  if (payload.score <= bestScore) {
    return null
  }

  const response = await fetch(`${SERVER_HOST}/api/v2/leaderboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: payload,
      ratingFieldName: LEADERBOARD_RATING_FIELD_NAME,
    }),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить результат')
  }

  const result = await response.json()

  setBestScoreToStorage(payload.score)

  return result.data as LeaderboardEntry
})

export const fetchLeaderboardThunk = createAsyncThunk<
  FetchLeaderboardResponse,
  FetchLeaderboardPayload | undefined
>('leaderboard/fetchLeaderboardThunk', async payload => {
  const response = await fetch(`${SERVER_HOST}/api/v2/leaderboard/all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ratingFieldName: LEADERBOARD_RATING_FIELD_NAME,
      cursor: payload?.cursor ?? 0,
      limit: payload?.limit ?? 10,
    }),
  })

  if (!response.ok) {
    throw new Error('Не удалось загрузить таблицу лидеров')
  }

  return response.json()
})

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    resetLeaderboard(state) {
      state.entries = []
      state.cursor = 0
      state.total = 0
      state.error = null
      state.fetchStatus = 'idle'
    },
    resetLeaderboardStatuses(state) {
      state.fetchStatus = 'idle'
      state.submitStatus = 'idle'
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      // submit
      .addCase(submitLeaderboardResultThunk.pending, state => {
        state.isSubmitting = true
        state.submitStatus = 'pending'
        state.error = null
      })
      .addCase(
        submitLeaderboardResultThunk.fulfilled,
        (state, action: PayloadAction<LeaderboardEntry | null>) => {
          state.isSubmitting = false
          state.submitStatus = 'success'

          if (!action.payload) return

          const existingIndex = state.entries.findIndex(entry => entry.id === action.payload?.id)

          if (existingIndex >= 0) {
            state.entries[existingIndex] = action.payload
          }
        }
      )
      .addCase(submitLeaderboardResultThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.submitStatus = 'error'
        state.error = action.error.message ?? 'Ошибка сохранения результата'
      })
      .addCase(fetchLeaderboardThunk.pending, state => {
        state.isLoading = true
        state.fetchStatus = 'pending'
        state.error = null
      })
      .addCase(fetchLeaderboardThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.fetchStatus = 'success'

        const append = action.meta.arg?.append ?? false

        if (append) {
          state.entries.push(...action.payload.data)
        } else {
          state.entries = action.payload.data
        }

        state.cursor = action.payload.cursor
        state.total = action.payload.total
      })
      .addCase(fetchLeaderboardThunk.rejected, (state, action) => {
        state.isLoading = false
        state.fetchStatus = 'error'
        state.error = action.error.message ?? 'Ошибка загрузки leaderboard'
      })
  },
})

export const { resetLeaderboard, resetLeaderboardStatuses } = leaderboardSlice.actions

export const selectLeaderboardEntries = (state: RootState) => state.leaderboard.entries

export const selectLeaderboardLoading = (state: RootState) => state.leaderboard.isLoading

export const selectLeaderboardSubmitting = (state: RootState) => state.leaderboard.isSubmitting

export const selectLeaderboardError = (state: RootState) => state.leaderboard.error

export const selectLeaderboardCursor = (state: RootState) => state.leaderboard.cursor

export const selectLeaderboardTotal = (state: RootState) => state.leaderboard.total

export const selectLeaderboardFetchStatus = (state: RootState) => state.leaderboard.fetchStatus

export const selectLeaderboardSubmitStatus = (state: RootState) => state.leaderboard.submitStatus

export default leaderboardSlice.reducer
