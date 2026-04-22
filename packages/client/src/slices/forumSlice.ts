import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { SERVER_HOST2 } from '@/constants'
import { Topic, Comment, ForumState, ReactionSummaryItem } from './forum.types'

export const FORUM_REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢', '👎'] as const

type ToggleReactionPayload = {
  commentId: number
  emoji: string
}

type ToggleReactionResponse = {
  status: 'added' | 'removed'
  comment_id: number
  reactionSummary: ReactionSummaryItem[]
  myReactions: string[]
}

const initialState: ForumState = {
  topics: [],
  currentComments: [],
  isLoading: false,
  error: null,
  latestReactionRequestByCommentId: {},
}

const fetchOptions = {}
const fetchWithCredentials = {
  ...fetchOptions,
  credentials: 'include' as const,
}

const getAuthHeaders = (state: RootState) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const userId = state.user.data?.id
  if (userId) {
    headers['x-auth-user-id'] = String(userId)
  }

  return headers
}

const normalizeCommentTree = (comment: Comment): Comment => ({
  ...comment,
  reactionSummary: Array.isArray(comment.reactionSummary) ? comment.reactionSummary : [],
  myReactions: Array.isArray(comment.myReactions) ? comment.myReactions : [],
  replies: Array.isArray(comment.replies) ? comment.replies.map(normalizeCommentTree) : [],
})

const sortReactionSummary = (summary: ReactionSummaryItem[]) => {
  const order: Record<string, number> = {}
  FORUM_REACTION_EMOJIS.forEach((emoji, index) => {
    order[emoji] = index
  })
  return [...summary].sort((left, right) => (order[left.emoji] || 0) - (order[right.emoji] || 0))
}

const toggleLocalReaction = (comment: Comment, emoji: string): Comment => {
  const reactionSummaryMap = new Map(comment.reactionSummary.map(item => [item.emoji, item.count]))
  const myReactionsSet = new Set(comment.myReactions)
  const alreadySelected = myReactionsSet.has(emoji)

  if (alreadySelected) {
    myReactionsSet.delete(emoji)
    const nextCount = Math.max((reactionSummaryMap.get(emoji) || 0) - 1, 0)
    if (nextCount === 0) {
      reactionSummaryMap.delete(emoji)
    } else {
      reactionSummaryMap.set(emoji, nextCount)
    }
  } else {
    myReactionsSet.add(emoji)
    reactionSummaryMap.set(emoji, (reactionSummaryMap.get(emoji) || 0) + 1)
  }

  return {
    ...comment,
    reactionSummary: sortReactionSummary(
      Array.from(reactionSummaryMap.entries()).map(([reactionEmoji, count]) => ({
        emoji: reactionEmoji,
        count,
      }))
    ),
    myReactions: FORUM_REACTION_EMOJIS.filter(reactionEmoji => myReactionsSet.has(reactionEmoji)),
  }
}

const updateCommentTree = (
  comments: Comment[],
  commentId: number,
  updater: (comment: Comment) => Comment
): Comment[] =>
  comments.map(comment => {
    if (comment.id === commentId) {
      return updater(comment)
    }

    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentTree(comment.replies, commentId, updater),
      }
    }

    return comment
  })

// Thunks
export const fetchTopicsThunk = createAsyncThunk(
  'forum/fetchTopics',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const res = await fetch(`${SERVER_HOST2}/api/forum/topics`, {
      ...fetchWithCredentials,
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
      ...fetchWithCredentials,
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
      ...fetchWithCredentials,
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
      ...fetchWithCredentials,
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

export const toggleCommentReactionThunk = createAsyncThunk<
  ToggleReactionResponse & ToggleReactionPayload,
  ToggleReactionPayload,
  { state: RootState; rejectValue: string }
>('forum/toggleCommentReaction', async (payload, { getState, rejectWithValue }) => {
  const state = getState()
  const res = await fetch(`${SERVER_HOST2}/api/forum/comments/${payload.commentId}/reactions`, {
    ...fetchWithCredentials,
    method: 'POST',
    headers: getAuthHeaders(state),
    body: JSON.stringify({ emoji: payload.emoji }),
  })

  if (!res.ok) {
    return rejectWithValue('Failed to toggle reaction')
  }

  const data = (await res.json()) as ToggleReactionResponse

  return {
    ...payload,
    ...data,
  }
})

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
        state.currentComments = payload.map(normalizeCommentTree)
        state.latestReactionRequestByCommentId = {}
      })

      .addCase(createCommentThunk.pending, state => {
        state.error = null
      })
      .addCase(createCommentThunk.fulfilled, (state, { payload }: PayloadAction<Comment>) => {
        if (!payload.parentId) {
          state.currentComments.push(normalizeCommentTree(payload))
        }
      })
      .addCase(createCommentThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })

      .addCase(toggleCommentReactionThunk.pending, (state, action) => {
        state.error = null
        state.latestReactionRequestByCommentId[String(action.meta.arg.commentId)] =
          action.meta.requestId
        state.currentComments = updateCommentTree(
          state.currentComments,
          action.meta.arg.commentId,
          comment => toggleLocalReaction(comment, action.meta.arg.emoji)
        )
      })
      .addCase(toggleCommentReactionThunk.fulfilled, (state, action) => {
        const commentKey = String(action.payload.commentId)
        const latestRequestId = state.latestReactionRequestByCommentId[commentKey]

        if (latestRequestId !== action.meta.requestId) {
          return
        }

        state.currentComments = updateCommentTree(
          state.currentComments,
          action.payload.commentId,
          comment => ({
            ...comment,
            reactionSummary: sortReactionSummary(action.payload.reactionSummary),
            myReactions: action.payload.myReactions,
          })
        )
        delete state.latestReactionRequestByCommentId[commentKey]
      })
      .addCase(toggleCommentReactionThunk.rejected, (state, action) => {
        const commentKey = String(action.meta.arg.commentId)
        const latestRequestId = state.latestReactionRequestByCommentId[commentKey]

        if (latestRequestId !== action.meta.requestId) {
          return
        }

        state.currentComments = updateCommentTree(
          state.currentComments,
          action.meta.arg.commentId,
          comment => toggleLocalReaction(comment, action.meta.arg.emoji)
        )
        state.error = (action.payload as string) || 'Failed to toggle reaction'
        delete state.latestReactionRequestByCommentId[commentKey]
      })
  },
})

export const { clearForumError } = forumSlice.actions

export const selectTopics = (state: RootState) => state.forum.topics
export const selectCurrentComments = (state: RootState) => state.forum.currentComments
export const selectForumLoading = (state: RootState) => state.forum.isLoading

export default forumSlice.reducer
