import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { SERVER_HOST } from '@/constants'

// --- Types ---

export type RequestStatus = 'idle' | 'pending' | 'success' | 'error'

export interface User {
  id?: string
  name: string
  secondName: string
  phone?: string
  avatarUrl?: string | null
  email?: string
  displayName?: string
  login?: string
}

export interface UserState {
  data: User | null
  isLoading: boolean
  authError: string | null
  error: string | null

  updateStatus: RequestStatus
  avatarStatus: RequestStatus
}

const initialState: UserState = {
  data: null,
  isLoading: true,
  authError: null,
  error: null,
  updateStatus: 'idle',
  avatarStatus: 'idle',
}

// --- Thunks ---

// 1. FETCH USER
export const fetchUserThunk = createAsyncThunk(
  'user/fetchUserThunk',
  async (_, { rejectWithValue }) => {
    const url = `${SERVER_HOST}/user`
    const res = await fetch(url)
    if (!res.ok) {
      const text = await res.text()
      // Если 401, то это не ошибка, а просто неавторизованный пользователь
      if (res.status === 401) {
        return rejectWithValue('Unauthorized')
      }
      throw new Error(text || `Ошибка ${res.status}`)
    }
    const user = (await res.json()) as User
    // Проверяем, что в ответе есть id пользователя
    if (!user || !user.id) {
      return rejectWithValue('User not found')
    }
    return user
  }
)

// 2. LOGIN
export interface LoginCredentials {
  email: string
  password: string
}
export const loginThunk = createAsyncThunk(
  'user/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    const res = await fetch(`${SERVER_HOST}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return rejectWithValue(data.message || `Ошибка входа ${res.status}`)
    }
    return data as User
  }
)

// 3. REGISTER
export interface RegisterPayload {
  email: string
  password: string
  name: string
  secondName: string
}
export const registerThunk = createAsyncThunk(
  'user/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    const res = await fetch(`${SERVER_HOST}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return rejectWithValue(data.message || `Ошибка регистрации ${res.status}`)
    }
    return data as User
  }
)

// 4. LOGOUT
export const logoutThunk = createAsyncThunk('user/logout', async () => {
  await fetch(`${SERVER_HOST}/auth/logout`, { method: 'POST' })
})

// 5. UPDATE USER
export const updateUserThunk = createAsyncThunk<
  User,
  { name: string; secondName: string; phone: string; email: string; displayName: string }
>('user/updateUserThunk', async payload => {
  const res = await fetch(`${SERVER_HOST}/user/profile`, {
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

    // Внимание: для FormData не нужно ставить Content-Type header вручную, браузер сам поставит boundary
    const res = await fetch(`${SERVER_HOST}/user/profile/avatar`, {
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
  const res = await fetch(`${SERVER_HOST}/user/profile/avatar`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error('Ошибка удаления аватара')
  }
  return res.json() as Promise<User>
})

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
        state.data = null // Убедимся, что данные пользователя очищены
        // Не устанавливаем authError, если это просто отсутствие сессии
        if (action.payload !== 'Unauthorized' && action.payload !== 'User not found') {
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
