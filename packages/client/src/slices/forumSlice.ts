import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { SERVER_HOST2 } from '@/constants'
import { Topic, Comment, ForumState } from './forum.types'

const initialState: ForumState = {
  topics: [],
  currentComments: [],
  isLoading: false,
  error: null,
}

const fetchOptions = {
  credentials: 'include' as const,
}

const getAuthHeaders = (state: RootState) => {
  const userId = state.user.data?.id || '1'
  return {
    'Content-Type': 'application/json',
    'x-auth-user-id': String(userId),
  }
}

// Thunks
export const fetchTopicsThunk = createAsyncThunk(
  'forum/fetchTopics',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const res = await fetch(`${SERVER_HOST2}/api/forum/topics`, {
      ...fetchOptions,
      headers: getAuthHeaders(state),
    })
    if (!res.ok) {
      return rejectWithValue('Failed to fetch topics')
    }
    return (await res.json()) as Topic[]
  }
)

export const createTopicThunk = createAsyncThunk(
  'forum/createTopic',
  async (
    payload: { title: string; description: string; author_id: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState
    const res = await fetch(`${SERVER_HOST2}/api/forum/topics`, {
      ...fetchOptions,
      method: 'POST',
      headers: getAuthHeaders(state),
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      return rejectWithValue('Failed to create topic')
    }
    return (await res.json()) as Topic
  }
)

export const fetchCommentsThunk = createAsyncThunk(
  'forum/fetchComments',
  async (topicId: number, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const res = await fetch(`${SERVER_HOST2}/api/forum/topics/${topicId}/comments`, {
      ...fetchOptions,
      headers: getAuthHeaders(state),
    })
    if (!res.ok) {
      return rejectWithValue('Failed to fetch comments')
    }
    return (await res.json()) as Comment[]
  }
)

export const createCommentThunk = createAsyncThunk(
  'forum/createComment',
  async (
    payload: { content: string; author_id: string; topic_id: number; parentId?: number },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState
    const res = await fetch(`${SERVER_HOST2}/api/forum/topics/${payload.topic_id}/comments`, {
      ...fetchOptions,
      method: 'POST',
      headers: getAuthHeaders(state),
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      return rejectWithValue('Failed to create comment')
    }
    return (await res.json()) as Comment
  }
)

export const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    clearForumError(state) {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTopicsThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTopicsThunk.fulfilled, (state, { payload }: PayloadAction<Topic[]>) => {
        state.topics = payload
        state.isLoading = false
      })
      .addCase(fetchTopicsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(createTopicThunk.pending, state => {
        state.error = null
      })
      .addCase(createTopicThunk.fulfilled, (state, { payload }: PayloadAction<Topic>) => {
        state.topics.unshift(payload)
      })
      .addCase(createTopicThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })

      .addCase(fetchCommentsThunk.fulfilled, (state, { payload }: PayloadAction<Comment[]>) => {
        state.currentComments = payload
      })

      .addCase(createCommentThunk.pending, state => {
        state.error = null
      })
      .addCase(createCommentThunk.fulfilled, (state, { payload }: PayloadAction<Comment>) => {
        if (!payload.parentId) {
          state.currentComments.push(payload)
        }
      })
      .addCase(createCommentThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearForumError } = forumSlice.actions

export const selectTopics = (state: RootState) => state.forum.topics
export const selectCurrentComments = (state: RootState) => state.forum.currentComments
export const selectForumLoading = (state: RootState) => state.forum.isLoading

export default forumSlice.reducer
