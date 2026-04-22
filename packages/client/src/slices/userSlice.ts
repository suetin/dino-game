import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { SERVER_HOST2, REDIRECT_URI } from '@/constants'

// --- Types ---

export type RequestStatus = 'idle' | 'pending' | 'success' | 'error'

export interface User {
  id?: string
  first_name: string
  second_name: string
  phone?: string
  avatar?: string | null
  avatarUrl?: string | null
  email?: string
  display_name?: string
  displayName?: string
  userName?: string
  login?: string
}

export interface UserState {
  data: User | null
  isLoading: boolean
  authError: string | null
  error: string | null
  serviceId: string | null
  currentAuthRequestId: string | null

  updateStatus: RequestStatus
  avatarStatus: RequestStatus
}

const initialState: UserState = {
  data: null,
  isLoading: true,
  authError: null,
  error: null,
  serviceId: null,
  currentAuthRequestId: null,
  updateStatus: 'idle',
  avatarStatus: 'idle',
}

type UserResponse = {
  id?: number | string
  first_name?: string | null
  second_name?: string | null
  display_name?: string | null
  displayName?: string | null
  login?: string | null
  userName?: string | null
  email?: string | null
  phone?: string | null
  avatar?: string | null
  avatarUrl?: string | null
}

const getAvatarUrl = (user: UserResponse) => {
  if (user.avatarUrl) {
    return user.avatarUrl
  }

  if (!user.avatar) {
    return null
  }

  if (
    user.avatar.startsWith('data:') ||
    user.avatar.startsWith('http://') ||
    user.avatar.startsWith('https://') ||
    user.avatar.startsWith('/')
  ) {
    return user.avatar
  }

  return `https://ya-praktikum.tech/api/v2/resources/${user.avatar}`
}

const normalizeUser = (user: UserResponse): User => {
  const displayName = user.display_name ?? user.displayName ?? ''
  const login = user.login ?? user.userName ?? ''

  return {
    id: user.id !== undefined ? String(user.id) : undefined,
    first_name: user.first_name ?? '',
    second_name: user.second_name ?? '',
    phone: user.phone ?? '',
    avatar: user.avatar ?? null,
    avatarUrl: getAvatarUrl(user),
    email: user.email ?? '',
    display_name: displayName,
    displayName,
    userName: login,
    login,
  }
}

const fetchOptions = {
  credentials: 'include' as const,
}

const postJsonOptions = {
  ...fetchOptions,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
}

// --- Thunks ---

// 1. FETCH USER
export const fetchUserThunk = createAsyncThunk<User, void, { state: RootState }>(
  'user/fetchUserThunk',
  async (_, { rejectWithValue }) => {
    try {
      const url = `${SERVER_HOST2}/api/auth/user`
      const res = await fetch(url, fetchOptions)
      if (!res.ok) {
        if (res.status === 401) {
          return rejectWithValue('Unauthorized')
        }
        if (res.status >= 500) {
          return rejectWithValue('ServerError')
        }

        const text = await res.text()
        return rejectWithValue(text || `Ошибка ${res.status}`)
      }

      const user = (await res.json()) as UserResponse
      return normalizeUser(user)
    } catch (_error) {
      return rejectWithValue('Сервер авторизации недоступен')
    }
  },
  {
    condition: (_, { getState }) => {
      return getState().user.currentAuthRequestId === null
    },
  }
)

// 2. LOGIN
export const loginThunk = createAsyncThunk<User, { login: string; password: string }>(
  'user/login',
  async (credentials: { login: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${SERVER_HOST2}/api/auth/signin`, {
        ...postJsonOptions,
        body: JSON.stringify(credentials),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return rejectWithValue(data.reason || `Ошибка входа ${res.status}`)
      }

      const user = (await res.json().catch(() => ({}))) as UserResponse
      return normalizeUser(user)
    } catch (_error) {
      return rejectWithValue('Не удалось подключиться к серверу авторизации')
    }
  }
)

// 3. REGISTER
export const registerThunk = createAsyncThunk(
  'user/register',
  async (
    payload: {
      email: string
      password: string
      first_name: string
      second_name: string
      login: string
      phone: string
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${SERVER_HOST2}/api/auth/signup`, {
        ...postJsonOptions,
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return rejectWithValue(data.reason || `Ошибка регистрации ${res.status}`)
      }

      const user = (await res.json().catch(() => ({}))) as UserResponse

      return normalizeUser({
        ...payload,
        ...user,
      })
    } catch (_error) {
      return rejectWithValue('Не удалось подключиться к серверу авторизации')
    }
  }
)

// 4. LOGOUT
export const logoutThunk = createAsyncThunk('user/logout', async () => {
  try {
    const res = await fetch(`${SERVER_HOST2}/api/auth/logout`, { ...postJsonOptions })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.reason || `Ошибка выхода ${res.status}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Не удалось подключиться к серверу авторизации')
  }
})

// 5. UPDATE USER
export const updateUserThunk = createAsyncThunk<
  User,
  { first_name: string; second_name: string; phone: string; email: string; display_name: string }
>('user/updateUserThunk', async payload => {
  const res = await fetch(`${SERVER_HOST2}/api/user/profile`, {
    ...fetchOptions,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error('Ошибка обновления профиля')
  }

  const user = (await res.json()) as UserResponse
  return normalizeUser(user)
})

// 6. UPLOAD AVATAR
export const uploadAvatarThunk = createAsyncThunk<User, File>(
  'user/uploadAvatarThunk',
  async file => {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await fetch(`${SERVER_HOST2}/api/user/profile/avatar`, {
      ...fetchOptions,
      method: 'PUT',
      body: formData,
    })
    if (!res.ok) {
      throw new Error('Ошибка загрузки аватара')
    }

    const user = (await res.json()) as UserResponse
    return normalizeUser(user)
  }
)

// 7. DELETE AVATAR
export const deleteAvatarThunk = createAsyncThunk<User>('user/deleteAvatarThunk', async () => {
  const res = await fetch(`${SERVER_HOST2}/api/user/profile/avatar`, {
    ...fetchOptions,
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error('Ошибка удаления аватара')
  }

  const user = (await res.json()) as UserResponse
  return normalizeUser(user)
})

// 8. OAUTH - GET SERVICE ID
export const fetchServiceIdThunk = createAsyncThunk<string>(
  'user/fetchServiceId',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${SERVER_HOST2}/api/oauth/yandex/service-id?redirect_uri=${REDIRECT_URI}`,
        fetchOptions
      )
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        return rejectWithValue(errorData.reason || `Ошибка получения service_id: ${res.status}`)
      }
      const data = await res.json()
      return data.service_id
    } catch (error) {
      return rejectWithValue('Сетевая ошибка или невалидный JSON при получении service_id')
    }
  }
)

// 9. OAUTH - START
export const fetchOauthStartUrlThunk = createAsyncThunk<string>(
  'user/fetchOauthStartUrl',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${SERVER_HOST2}/api/oauth/yandex/start?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
        fetchOptions
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        return rejectWithValue(errorData.reason || `Ошибка старта OAuth: ${res.status}`)
      }

      const data = (await res.json()) as { authorization_url?: unknown }
      if (typeof data.authorization_url !== 'string' || !data.authorization_url.trim()) {
        return rejectWithValue('Некорректный ответ OAuth start')
      }

      return data.authorization_url
    } catch (_error) {
      return rejectWithValue('Сетевая ошибка или невалидный JSON при старте OAuth')
    }
  }
)

// 10. OAUTH - LOGIN
export const oauthLoginThunk = createAsyncThunk<User, { code: string; state: string }>(
  'user/oauthLogin',
  async ({ code, state }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${SERVER_HOST2}/api/oauth/yandex`, {
        ...postJsonOptions,
        body: JSON.stringify({ code, state, redirect_uri: REDIRECT_URI }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return rejectWithValue(data.reason || `Ошибка OAuth ${res.status}`)
      }

      const user = (await res.json().catch(() => ({}))) as UserResponse
      return normalizeUser(user)
    } catch (_error) {
      return rejectWithValue('Не удалось подключиться к серверу авторизации')
    }
  }
)

// --- Slice ---

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.authError = null
    },
    setAuthError(state, { payload }: PayloadAction<string | null>) {
      state.authError = payload
    },
    resetUserStatuses(state) {
      state.updateStatus = 'idle'
      state.avatarStatus = 'idle'
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      // FETCH
      .addCase(fetchUserThunk.pending, (state, action) => {
        state.isLoading = true
        state.currentAuthRequestId = action.meta.requestId
      })
      .addCase(fetchUserThunk.fulfilled, (state, action) => {
        if (state.currentAuthRequestId !== action.meta.requestId) {
          return
        }

        const payload = action.payload
        state.data = payload
        state.isLoading = false
        state.currentAuthRequestId = null
        state.authError = null
      })
      .addCase(fetchUserThunk.rejected, (state, action) => {
        if (state.currentAuthRequestId !== action.meta.requestId) {
          return
        }

        state.isLoading = false
        state.currentAuthRequestId = null
        if (action.payload === 'Unauthorized') {
          state.data = null
          return
        }

        if (action.payload && action.payload !== 'User not found') {
          state.authError = (action.payload as string) || action.error.message || 'Ошибка'
        }
      })

      // LOGIN
      .addCase(loginThunk.pending, state => {
        state.authError = null
      })
      .addCase(loginThunk.fulfilled, (state, { payload }: PayloadAction<User>) => {
        state.data = payload
        state.authError = null
        state.currentAuthRequestId = null
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.authError = (action.payload as string) || action.error.message || 'Ошибка входа'
      })

      // REGISTER
      .addCase(registerThunk.pending, state => {
        state.authError = null
      })
      .addCase(registerThunk.fulfilled, (state, { payload }: PayloadAction<User>) => {
        state.data = payload
        state.authError = null
        state.currentAuthRequestId = null
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.authError = (action.payload as string) || action.error.message || 'Ошибка регистрации'
      })

      // LOGOUT
      .addCase(logoutThunk.fulfilled, state => {
        state.data = null
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.authError = action.error.message || 'Ошибка выхода'
      })

      // OAUTH - SERVICE ID
      .addCase(fetchServiceIdThunk.fulfilled, (state, { payload }: PayloadAction<string>) => {
        state.serviceId = payload
      })
      .addCase(fetchServiceIdThunk.rejected, (state, action) => {
        console.error('OAuth Service ID Error:', action.payload)
        state.serviceId = null
      })

      // OAUTH - LOGIN
      .addCase(oauthLoginThunk.pending, state => {
        state.authError = null
      })
      .addCase(oauthLoginThunk.fulfilled, (state, { payload }: PayloadAction<User>) => {
        state.data = payload
        state.authError = null
        state.currentAuthRequestId = null
      })
      .addCase(oauthLoginThunk.rejected, (state, action) => {
        state.authError = (action.payload as string) || action.error.message || 'Ошибка OAuth'
      })

      // UPDATE
      .addCase(updateUserThunk.pending, state => {
        state.updateStatus = 'pending'
        state.error = null
      })
      .addCase(updateUserThunk.fulfilled, (state, { payload }: PayloadAction<User>) => {
        state.data = payload
        state.updateStatus = 'success'
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.updateStatus = 'error'
        state.error = action.error.message ?? 'Ошибка обновления'
      })

      // AVATAR UPLOAD
      .addCase(uploadAvatarThunk.pending, state => {
        state.avatarStatus = 'pending'
        state.error = null
      })
      .addCase(uploadAvatarThunk.fulfilled, (state, { payload }: PayloadAction<User>) => {
        state.data = payload
        state.avatarStatus = 'success'
      })
      .addCase(uploadAvatarThunk.rejected, (state, action) => {
        state.avatarStatus = 'error'
        state.error = action.error.message ?? 'Ошибка загрузки аватара'
      })

      // AVATAR DELETE
      .addCase(deleteAvatarThunk.pending, state => {
        state.avatarStatus = 'pending'
        state.error = null
      })
      .addCase(deleteAvatarThunk.fulfilled, (state, { payload }: PayloadAction<User>) => {
        state.data = payload
        state.avatarStatus = 'success'
      })
      .addCase(deleteAvatarThunk.rejected, (state, action) => {
        state.avatarStatus = 'error'
        state.error = action.error.message ?? 'Ошибка удаления аватара'
      })
  },
})

export const { clearAuthError, setAuthError, resetUserStatuses } = userSlice.actions

export const selectUser = (state: RootState) => state.user.data
export const selectAuthError = (state: RootState) => state.user.authError
export const selectUserLoading = (state: RootState) => state.user.isLoading
export const selectUserError = (state: RootState) => state.user.error
export const selectUserUpdateStatus = (state: RootState) => state.user.updateStatus
export const selectUserAvatarStatus = (state: RootState) => state.user.avatarStatus

export default userSlice.reducer
