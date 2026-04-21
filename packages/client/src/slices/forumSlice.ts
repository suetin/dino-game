import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { SERVER_HOST2 } from '@/constants'
import { Topic, Comment, ForumState } from './forum.types'

type DataSource = 'network' | 'cache'

const FORUM_TOPICS_CACHE_KEY = 'dino-game-forum-topics-cache-v1'
const FORUM_COMMENTS_CACHE_PREFIX = 'dino-game-forum-comments-cache-v1'

type TopicsSnapshot = {
  topics: Topic[]
}

type CommentsSnapshot = {
  comments: Comment[]
}

const getCommentsCacheKey = (topicId: number) => `${FORUM_COMMENTS_CACHE_PREFIX}:${topicId}`

const loadTopicsSnapshot = (): TopicsSnapshot | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(FORUM_TOPICS_CACHE_KEY)

    if (!raw) {
      return null
    }

    return JSON.parse(raw) as TopicsSnapshot
  } catch (error) {
    return null
  }
}

const saveTopicsSnapshot = (topics: Topic[]) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      FORUM_TOPICS_CACHE_KEY,
      JSON.stringify({ topics } satisfies TopicsSnapshot)
    )
  } catch (error) {
    return
  }
}

const loadCommentsSnapshot = (topicId: number): CommentsSnapshot | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(getCommentsCacheKey(topicId))

    if (!raw) {
      return null
    }

    return JSON.parse(raw) as CommentsSnapshot
  } catch (error) {
    return null
  }
}

const saveCommentsSnapshot = (topicId: number, comments: Comment[]) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      getCommentsCacheKey(topicId),
      JSON.stringify({ comments } satisfies CommentsSnapshot)
    )
  } catch (error) {
    return
  }
}

const isNetworkFailure = (message?: string) => message === 'Failed to fetch'

const initialState: ForumState & { dataSource: DataSource } = {
  topics: [],
  currentComments: [],
  isLoading: false,
  error: null,
  dataSource: 'network',
}

const fetchOptions = {}

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
    const comments = (await res.json()) as Comment[]
    saveCommentsSnapshot(topicId, comments)
    return comments
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
        state.error = null
        state.dataSource = 'network'
        saveTopicsSnapshot(payload)
      })
      .addCase(fetchTopicsThunk.rejected, (state, action) => {
        state.isLoading = false
        const snapshot = loadTopicsSnapshot()

        if (isNetworkFailure(action.error.message) && snapshot) {
          state.topics = snapshot.topics
          state.error = null
          state.dataSource = 'cache'
          return
        }

        state.error = action.payload as string
        state.dataSource = 'network'
      })

      .addCase(createTopicThunk.pending, state => {
        state.error = null
      })
      .addCase(createTopicThunk.fulfilled, (state, { payload }: PayloadAction<Topic>) => {
        state.topics.unshift(payload)
        state.dataSource = 'network'
      })
      .addCase(createTopicThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })

      .addCase(fetchCommentsThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCommentsThunk.fulfilled, (state, { payload }: PayloadAction<Comment[]>) => {
        state.currentComments = payload
        state.isLoading = false
        state.error = null
        state.dataSource = 'network'
      })
      .addCase(fetchCommentsThunk.rejected, (state, action) => {
        state.isLoading = false
        const snapshot = loadCommentsSnapshot(action.meta.arg)

        if (isNetworkFailure(action.error.message) && snapshot) {
          state.currentComments = snapshot.comments
          state.error = null
          state.dataSource = 'cache'
          return
        }

        state.error = action.payload as string
        state.dataSource = 'network'
      })

      .addCase(createCommentThunk.pending, state => {
        state.error = null
      })
      .addCase(createCommentThunk.fulfilled, (state, { payload }: PayloadAction<Comment>) => {
        if (!payload.parentId) {
          state.currentComments.push(payload)
        }
        state.dataSource = 'network'
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
export const selectForumDataSource = (state: RootState) => state.forum.dataSource

export default forumSlice.reducer
