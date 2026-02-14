import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { defaultUser, initialState, LS_KEY } from '@/entities/profile/profile.api.mock'

type RequestStatus = 'idle' | 'pending' | 'success' | 'error'

export interface User {
  id: string
  name: string
  secondName: string
  phone?: string
  avatarUrl?: string | null
  email?: string
  displayName?: string
}

export interface UserState {
  data: User | null
  isLoading: boolean
  error: string | null

  updateStatus: RequestStatus
  avatarStatus: RequestStatus
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

const isBrowser = typeof window !== 'undefined'

function loadUser(): User {
  if (!isBrowser) return defaultUser

  const raw = localStorage.getItem(LS_KEY)
  if (!raw) return defaultUser

  try {
    return { ...defaultUser, ...(JSON.parse(raw) as Partial<User>) }
  } catch {
    return defaultUser
  }
}

function saveUser(user: User) {
  if (!isBrowser) return
  localStorage.setItem(LS_KEY, JSON.stringify(user))
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}

//
// FETCH USER (mock)
//
export const fetchUserThunk = createAsyncThunk<User>('user/fetchUserThunk', async () => {
  await sleep(500)
  const user = loadUser()
  saveUser(user)
  return user
})

//
// UPDATE USER (mock)
//
export const updateUserThunk = createAsyncThunk<
  User,
  { name: string; secondName: string; phone: string; email: string; displayName: string }
>('user/updateUserThunk', async payload => {
  await sleep(600)
  const current = loadUser()
  const updated: User = { ...current, ...payload }
  saveUser(updated)
  return updated
})

//
// UPLOAD AVATAR (mock)
//
export const uploadAvatarThunk = createAsyncThunk<User, File>(
  'user/uploadAvatarThunk',
  async file => {
    await sleep(700)
    const current = loadUser()
    const avatarUrl = await fileToDataUrl(file)
    const updated: User = { ...current, avatarUrl }
    saveUser(updated)
    return updated
  }
)

//
// DELETE AVATAR (mock)
//
export const deleteAvatarThunk = createAsyncThunk<User>('user/deleteAvatarThunk', async () => {
  await sleep(400)
  const current = loadUser()
  const updated: User = { ...current, avatarUrl: null }
  saveUser(updated)
  return updated
})

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
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
        state.error = null
      })
      .addCase(fetchUserThunk.fulfilled, (state, { payload }: PayloadAction<User>) => {
        state.data = payload
        state.isLoading = false
      })
      .addCase(fetchUserThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? 'Ошибка загрузки'
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

export const { resetUserStatuses } = userSlice.actions

export const selectUser = (state: RootState) => state.user.data
export const selectUserLoading = (state: RootState) => state.user.isLoading
export const selectUserError = (state: RootState) => state.user.error
export const selectUserUpdateStatus = (state: RootState) => state.user.updateStatus
export const selectUserAvatarStatus = (state: RootState) => state.user.avatarStatus

export default userSlice.reducer
