export const THEMES = ['light', 'dark', 'ocean'] as const
export type AppTheme = (typeof THEMES)[number]

export const THEME_STORAGE_KEY = 'app_theme'

const DARK_THEMES: AppTheme[] = ['dark', 'ocean']

export const isDarkLikeTheme = (theme: AppTheme) => DARK_THEMES.includes(theme)

export const isAppTheme = (value: string): value is AppTheme => THEMES.includes(value as AppTheme)

export const getStoredTheme = (): AppTheme | null => {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value && isAppTheme(value) ? value : null
  } catch {
    return null
  }
}

export const setStoredTheme = (theme: AppTheme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export const applyTheme = (theme: AppTheme) => {
  const root = document.documentElement

  root.dataset.theme = theme

  if (isDarkLikeTheme(theme)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const getInitialTheme = (): AppTheme => {
  const stored = getStoredTheme()
  if (stored) return stored

  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }

  return 'light'
}
