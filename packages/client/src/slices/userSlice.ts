import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/store'

export interface User {
  id: number
  name: string
  second_name: string
  display_name: string | null
  login: string
  email: string
  phone: string
  avatar: string | null
}

export interface LoginRequest {
  login: string
  password: string
}

export interface RegisterRequest {
  name: string
  second_name: string
  login: string
  email: string
  password: string
  phone: string
}

export interface UserState {
  data: User | null
  isLoading: boolean
  error: string | null
}

const initialState: UserState = {
  data: null,
  isLoading: false,
  error: null,
}

// --- MOCK API (Заглушки) ---

const MOCK_USER: User = {
  id: 1,
  name: 'Степа',
  second_name: 'Степанов',
  display_name: 'Stepa',
  login: 'stepa',
  email: 'stepa@example.com',
  phone: '89000000000',
  avatar: null,
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const fetchUserThunk = createAsyncThunk<User>(
  'user/fetchUser',
  async (_, { rejectWithValue }) => {
    await wait(500)

    const isAuth = localStorage.getItem('isAuth') === 'true'

    if (isAuth) {
      return MOCK_USER
    }

    return rejectWithValue('Не авторизован')
  }
)

export const loginThunk = createAsyncThunk<void, LoginRequest>(
  'user/login',
  async (data, { dispatch, rejectWithValue }) => {
    await wait(1000)

    if (data.login === 'error') {
      return rejectWithValue('Неверный логин или пароль')
    }

    localStorage.setItem('isAuth', 'true')
    await dispatch(fetchUserThunk())
  }
)

export const registerThunk = createAsyncThunk<void, RegisterRequest>(
  'user/register',
  async (data, { dispatch, rejectWithValue }) => {
    await wait(1000)

    if (data.login === 'error') {
      return rejectWithValue('Пользователь уже существует')
    }

    localStorage.setItem('isAuth', 'true')
    await dispatch(fetchUserThunk())
  }
)

export const logoutThunk = createAsyncThunk('user/logout', async () => {
  await wait(500)
  localStorage.removeItem('isAuth')
})

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
  },
  extraReducers: builder => {
    // Fetch User
    builder
      .addCase(fetchUserThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserThunk.fulfilled, (state, action) => {
        state.data = action.payload
        state.isLoading = false
      })
      .addCase(fetchUserThunk.rejected, state => {
        state.isLoading = false
        state.data = null
      })

    // Login
    builder
      .addCase(loginThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, state => {
        state.isLoading = false
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Register
    builder
      .addCase(registerThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerThunk.fulfilled, state => {
        state.isLoading = false
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Logout
    builder.addCase(logoutThunk.fulfilled, state => {
      state.data = null
    })
  },
})

export const { clearError } = userSlice.actions

export const selectUser = (state: RootState) => state.user.data
export const selectUserLoading = (state: RootState) => state.user.isLoading
export const selectUserError = (state: RootState) => state.user.error

export default userSlice.reducer
