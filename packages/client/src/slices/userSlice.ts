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
  avatarUrl?: string | null
  email?: string
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

  updateStatus: RequestStatus
  avatarStatus: RequestStatus
}

const initialState: UserState = {
  data: null,
  isLoading: true,
  authError: null,
  error: null,
  serviceId: null,
  updateStatus: 'idle',
  avatarStatus: 'idle',
}

type PraktikumUser = {
  id: number
  first_name: string
  second_name: string
  display_name: string | null
  login: string
  email: string
  phone: string
  avatar: string | null
}

const mapPraktikumUser = (user: PraktikumUser): User => ({
  id: String(user.id),
  first_name: user.first_name,
  second_name: user.second_name,
  displayName: user.display_name ?? '',
  login: user.login,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatar ? `https://ya-praktikum.tech/api/v2/resources/${user.avatar}` : null,
})

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
export const fetchUserThunk = createAsyncThunk(
  'user/fetchUserThunk',
  async (_, { rejectWithValue }) => {
    const url = `${SERVER_HOST2}/auth/user`
    const res = await fetch(url, fetchOptions)
    if (!res.ok) {
      const text = await res.text()
      if (res.status === 401) {
        return rejectWithValue('Unauthorized')
      }
      throw new Error(text || `Ошибка ${res.status}`)
    }

    const user = (await res.json()) as PraktikumUser
    return mapPraktikumUser(user)
  }
)

// 2. LOGIN
export const loginThunk = createAsyncThunk(
  'user/login',
  async (credentials: { login: string; password: string }, { rejectWithValue }) => {
    const res = await fetch(`${SERVER_HOST2}/auth/signin`, {
      ...postJsonOptions,
      body: JSON.stringify(credentials),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return rejectWithValue(data.reason || `Ошибка входа ${res.status}`)
    }
    return {} as User
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
    const res = await fetch(`${SERVER_HOST2}/auth/signup`, {
      ...postJsonOptions,
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return rejectWithValue(data.reason || `Ошибка регистрации ${res.status}`)
    }
    return { id: (await res.json()).id } as User
  }
)

// 4. LOGOUT
export const logoutThunk = createAsyncThunk('user/logout', async () => {
  await fetch(`${SERVER_HOST2}/auth/logout`, { ...postJsonOptions })
})

// 5. UPDATE USER
export const updateUserThunk = createAsyncThunk<
  User,
  { first_name: string; second_name: string; phone: string; email: string; display_name: string }
>('user/updateUserThunk', async payload => {
  const res = await fetch(`${SERVER_HOST2}/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error('Ошибка обновления профиля')
  }
  return res.json() as Promise<User>
})

// 6. UPLOAD AVATAR
export const uploadAvatarThunk = createAsyncThunk<User, File>(
  'user/uploadAvatarThunk',
  async file => {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await fetch(`${SERVER_HOST2}/user/profile/avatar`, {
      ...fetchOptions,
      method: 'PUT',
      body: formData,
    })
    if (!res.ok) {
      throw new Error('Ошибка загрузки аватара')
    }
    return res.json() as Promise<User>
  }
)

// 7. DELETE AVATAR
export const deleteAvatarThunk = createAsyncThunk<User>('user/deleteAvatarThunk', async () => {
  const res = await fetch(`${SERVER_HOST2}/user/profile/avatar`, {
    ...fetchOptions,
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error('Ошибка удаления аватара')
  }
  return res.json() as Promise<User>
})

// 8. OAUTH - GET SERVICE ID
export const fetchServiceIdThunk = createAsyncThunk<string>(
  'user/fetchServiceId',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${SERVER_HOST2}/oauth/yandex/service-id?redirect_uri=${REDIRECT_URI}`,
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

// 9. OAUTH - LOGIN
export const oauthLoginThunk = createAsyncThunk<void, string>(
  'user/oauthLogin',
  async (code, { rejectWithValue }) => {
    const res = await fetch(`${SERVER_HOST2}/oauth/yandex`, {
      ...postJsonOptions,
      body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return rejectWithValue(data.reason || `Ошибка OAuth ${res.status}`)
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
    resetUserStatuses(state) {
      state.updateStatus = 'idle'
      state.avatarStatus = 'idle'
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      // FETCH
      .addCase(fetchUserThunk.pending, state => {
        state.isLoading = true
      })
      .addCase(fetchUserThunk.fulfilled, (state, { payload }: PayloadAction<User>) => {
        state.data = payload
        state.isLoading = false
        state.authError = null
      })
      .addCase(fetchUserThunk.rejected, (state, action) => {
        state.isLoading = false
        state.data = null
        if (action.payload !== 'Unauthorized' && action.payload !== 'User not found') {
          state.authError = (action.payload as string) || action.error.message || 'Ошибка'
        }
      })

      // LOGIN
      .addCase(loginThunk.pending, state => {
        state.authError = null
      })
      .addCase(loginThunk.fulfilled, state => {
        state.authError = null
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
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.authError = (action.payload as string) || action.error.message || 'Ошибка регистрации'
      })

      // LOGOUT
      .addCase(logoutThunk.fulfilled, state => {
        state.data = null
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
      .addCase(oauthLoginThunk.fulfilled, state => {
        state.authError = null
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

export const { clearAuthError, resetUserStatuses } = userSlice.actions

export const selectUser = (state: RootState) => state.user.data
export const selectAuthError = (state: RootState) => state.user.authError
export const selectUserLoading = (state: RootState) => state.user.isLoading
export const selectUserError = (state: RootState) => state.user.error
export const selectUserUpdateStatus = (state: RootState) => state.user.updateStatus
export const selectUserAvatarStatus = (state: RootState) => state.user.avatarStatus

export default userSlice.reducer
