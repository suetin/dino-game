import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { SERVER_HOST2 } from '@/constants'

export const LEADERBOARD_RATING_FIELD_NAME = 'score'
export const LEADERBOARD_TEAM_NAME = 'dino-team'

type RequestStatus = 'idle' | 'pending' | 'success' | 'error'

export type LeaderboardEntry = {
  data: {
    name: string
    score: number
  }
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

export interface LeaderboardState {
  entries: LeaderboardEntry[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  total: number
  hasMore: boolean
  fetchStatus: RequestStatus
  submitStatus: RequestStatus
}

const initialState: LeaderboardState = {
  entries: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  total: 0,
  hasMore: true,
  fetchStatus: 'idle',
  submitStatus: 'idle',
}

type RawLeaderboardEntry = {
  data: {
    score: number
    name?: string
    userName?: string
    username?: string
    user?: string
    login?: string
  }
}

const getLeaderboardEntryName = (data: RawLeaderboardEntry['data']) =>
  data.name || data.userName || data.username || data.user || data.login || 'Anonymous'

const normalizeLeaderboardEntry = (entry: RawLeaderboardEntry): LeaderboardEntry => ({
  data: {
    name: getLeaderboardEntryName(entry.data),
    score: entry.data.score,
  },
})

type FetchLeaderboardResponse = LeaderboardEntry[]

export const submitLeaderboardResultThunk = createAsyncThunk<
  LeaderboardEntry[] | null,
  SubmitLeaderboardPayload
>('leaderboard/submitLeaderboardResultThunk', async payload => {
  const response = await fetch(`${SERVER_HOST2}/api/leaderboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      data: payload,
      ratingFieldName: LEADERBOARD_RATING_FIELD_NAME,
      teamName: LEADERBOARD_TEAM_NAME,
    }),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить результат')
  }

  return null
})

export const fetchLeaderboardThunk = createAsyncThunk<
  FetchLeaderboardResponse,
  FetchLeaderboardPayload | undefined
>('leaderboard/fetchLeaderboardThunk', async payload => {
  const response = await fetch(`${SERVER_HOST2}/api/leaderboard/all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      ratingFieldName: LEADERBOARD_RATING_FIELD_NAME,
      teamName: LEADERBOARD_TEAM_NAME,
      cursor: payload?.cursor ?? 0,
      limit: payload?.limit ?? 10,
    }),
  })

  if (!response.ok) {
    throw new Error('Не удалось загрузить таблицу лидеров')
  }

  const result = (await response.json()) as {
    data: RawLeaderboardEntry[]
    cursor: number | null
    total: number
  }

  return result.data.map(normalizeLeaderboardEntry)
})

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    resetLeaderboard(state) {
      state.entries = []
      state.total = 0
      state.hasMore = true
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
      .addCase(submitLeaderboardResultThunk.pending, state => {
        state.isSubmitting = true
        state.submitStatus = 'pending'
        state.error = null
      })
      .addCase(submitLeaderboardResultThunk.fulfilled, state => {
        state.isSubmitting = false
        state.submitStatus = 'success'
      })
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
        const limit = action.meta.arg?.limit ?? 10

        if (append) {
          state.entries.push(...action.payload)
        } else {
          state.entries = action.payload
        }

        state.total = state.entries.length
        state.hasMore = action.payload.length === limit
      })
      .addCase(fetchLeaderboardThunk.rejected, (state, action) => {
        state.isLoading = false
        state.fetchStatus = 'error'
        state.error = action.error.message ?? 'Ошибка загрузки таблицы лидеров'
      })
  },
})

export const { resetLeaderboard, resetLeaderboardStatuses } = leaderboardSlice.actions

export const selectLeaderboardEntries = (state: RootState) => state.leaderboard.entries

export const selectLeaderboardLoading = (state: RootState) => state.leaderboard.isLoading

export const selectLeaderboardSubmitting = (state: RootState) => state.leaderboard.isSubmitting

export const selectLeaderboardError = (state: RootState) => state.leaderboard.error

export const selectLeaderboardTotal = (state: RootState) => state.leaderboard.total

export const selectLeaderboardHasMore = (state: RootState) => state.leaderboard.hasMore

export const selectLeaderboardFetchStatus = (state: RootState) => state.leaderboard.fetchStatus

export const selectLeaderboardSubmitStatus = (state: RootState) => state.leaderboard.submitStatus

export default leaderboardSlice.reducer
