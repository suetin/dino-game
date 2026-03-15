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
  userName?: string
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

const PRAKTIKUM_API_URL = 'https://ya-praktikum.tech/api/v2'

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
  name: user.first_name,
  secondName: user.second_name,
  displayName: user.display_name ?? '',
  login: user.login,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatar ? `https://ya-praktikum.tech/api/v2/resources/${user.avatar}` : null,
})

// --- Thunks ---

// 1. FETCH USER
export const fetchUserThunk = createAsyncThunk(
  'user/fetchUserThunk',
  async (_, { rejectWithValue }) => {
    const res = await fetch(`${PRAKTIKUM_API_URL}/auth/user`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!res.ok) {
      if (res.status === 401) {
        return rejectWithValue('Unauthorized')
      }

      const errorData = await res.json().catch(() => ({}))
      return rejectWithValue(errorData.reason || `Ошибка ${res.status}`)
    }

    const user = (await res.json()) as PraktikumUser
    return mapPraktikumUser(user)
  }
)

// 2. LOGIN
export interface LoginCredentials {
  login: string
  password: string
}
export const loginThunk = createAsyncThunk(
  'user/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    const res = await fetch(`${PRAKTIKUM_API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return rejectWithValue(data.reason || `Ошибка входа ${res.status}`)
    }

    const userRes = await fetch(`${PRAKTIKUM_API_URL}/auth/user`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!userRes.ok) {
      const data = await userRes.json().catch(() => ({}))
      return rejectWithValue(data.reason || `Ошибка получения пользователя ${userRes.status}`)
    }

    const user = (await userRes.json()) as PraktikumUser
    return mapPraktikumUser(user)
  }
)

// 3. REGISTER

export interface RegisterPayload {
  email: string
  password: string
  name: string
  secondName: string
  login?: string
  phone?: string
}

export const registerThunk = createAsyncThunk(
  'user/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    const signupRes = await fetch(`${PRAKTIKUM_API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        first_name: payload.name,
        second_name: payload.secondName,
        login: payload.login,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
      }),
    })

    if (!signupRes.ok) {
      const data = await signupRes.json().catch(() => ({}))
      return rejectWithValue(data.reason || `Ошибка регистрации ${signupRes.status}`)
    }

    const userRes = await fetch(`${PRAKTIKUM_API_URL}/auth/user`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!userRes.ok) {
      const data = await userRes.json().catch(() => ({}))
      return rejectWithValue(data.reason || `Ошибка получения пользователя ${userRes.status}`)
    }

    const user = (await userRes.json()) as PraktikumUser
    return mapPraktikumUser(user)
  }
)

// 4. LOGOUT
export const logoutThunk = createAsyncThunk('user/logout', async (_, { rejectWithValue }) => {
  const res = await fetch(`${PRAKTIKUM_API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return rejectWithValue(data.reason || `Ошибка выхода ${res.status}`)
  }
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
        if (action.payload === 'Unauthorized' || action.payload === 'User not found') {
          state.data = null
        }

        if (action.payload !== 'Unauthorized' && action.payload !== 'User not found') {
          state.error =
            (action.payload as string) || action.error.message || 'Ошибка загрузки данных'
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
