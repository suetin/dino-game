import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { SERVER_HOST } from '@/constants'

export interface User {
  name: string
  secondName: string
}

export interface UserState {
  data: User | null
  isLoading: boolean
  authError: string | null
}

const initialState: UserState = {
  data: null,
  isLoading: false,
  authError: null,
}

export const fetchUserThunk = createAsyncThunk('user/fetchUserThunk', async () => {
  const url = `${SERVER_HOST}/user`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Ошибка ${res.status}`)
  }
  return res.json()
})

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

export const logoutThunk = createAsyncThunk('user/logout', async () => {
  await fetch(`${SERVER_HOST}/auth/logout`, { method: 'POST' })
})

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.authError = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserThunk.pending, state => {
        state.isLoading = true
      })
      .addCase(fetchUserThunk.fulfilled, (state, { payload }: PayloadAction<User>) => {
        state.data = payload
        state.isLoading = false
        state.authError = null
      })
      .addCase(fetchUserThunk.rejected, state => {
        state.isLoading = false
      })
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
      .addCase(logoutThunk.fulfilled, state => {
        state.data = null
      })
  },
})

export const { clearAuthError } = userSlice.actions

export const selectUser = (state: RootState) => state.user.data
export const selectAuthError = (state: RootState) => state.user.authError

export default userSlice.reducer
