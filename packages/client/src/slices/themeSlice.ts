import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import { AppTheme, THEMES, applyTheme, isDarkLikeTheme } from '@/lib/theme'
import { loadThemePreference, saveThemePreference } from '@/lib/themeService'

interface ThemeState {
  theme: AppTheme
  isLoading: boolean
}

const initialState: ThemeState = {
  theme: 'light',
  isLoading: false,
}

// --- THUNKS ---

export const initThemeThunk = createAsyncThunk('theme/initTheme', async () => {
  const theme = await loadThemePreference()
  applyTheme(theme)
  return theme
})

export const setThemeThunk = createAsyncThunk('theme/setTheme', async (theme: AppTheme) => {
  await saveThemePreference(theme)
  applyTheme(theme)
  return theme
})

// --- SLICE ---

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      const currentIndex = THEMES.indexOf(state.theme)
      const nextTheme = THEMES[(currentIndex + 1) % THEMES.length]

      state.theme = nextTheme
      applyTheme(nextTheme)
      saveThemePreference(nextTheme)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initThemeThunk.pending, state => {
        state.isLoading = true
      })
      .addCase(initThemeThunk.fulfilled, (state, action: PayloadAction<AppTheme>) => {
        state.isLoading = false
        state.theme = action.payload
      })
      .addCase(initThemeThunk.rejected, state => {
        state.isLoading = false
      })

      .addCase(setThemeThunk.fulfilled, (state, action: PayloadAction<AppTheme>) => {
        state.theme = action.payload
      })
  },
})

export const { toggleTheme } = themeSlice.actions

export const selectTheme = (state: RootState) => state.theme.theme
export const selectIsDarkMode = (state: RootState) => isDarkLikeTheme(state.theme.theme)

export default themeSlice.reducer
