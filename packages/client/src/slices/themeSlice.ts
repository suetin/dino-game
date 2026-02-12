import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/store'

interface ThemeState {
  isDarkMode: boolean
}

// Эта функция работает только при инициализации скрипта (до создания стора)
const getInitialTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

const initialState: ThemeState = {
  isDarkMode: getInitialTheme(),
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: state => {
      state.isDarkMode = !state.isDarkMode

      if (typeof window !== 'undefined') {
        const root = window.document.documentElement
        if (state.isDarkMode) {
          root.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        } else {
          root.classList.remove('dark')
          localStorage.setItem('theme', 'light')
        }
      }
    },
    initTheme: state => {
      if (typeof window !== 'undefined') {
        // Читаем актуальное значение из хранилища
        const savedTheme = localStorage.getItem('theme')
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        // Определяем, должна ли быть темная тема
        const shouldBeDark = savedTheme ? savedTheme === 'dark' : systemDark

        // Обновляем стейт
        state.isDarkMode = shouldBeDark

        // Применяем класс
        const root = window.document.documentElement
        if (shouldBeDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    },
  },
})

export const { toggleTheme, initTheme } = themeSlice.actions

export const selectIsDarkMode = (state: RootState) => state.theme.isDarkMode

export default themeSlice.reducer
