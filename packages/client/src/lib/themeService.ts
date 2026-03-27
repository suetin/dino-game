import { AppTheme, getInitialTheme, getStoredTheme, setStoredTheme } from '@/lib/theme'

// TODO: заменить на реальный endpoint backend
// const THEME_API_URL = '/api/user/theme'

export const loadThemePreference = async (): Promise<AppTheme> => {
  // --- БУДУЩИЙ API ---
  /*
  const response = await fetch(THEME_API_URL, {
    method: 'GET',
    credentials: 'include',
  })

  if (response.ok) {
    const data = await response.json()
    return data.theme as AppTheme
  }
  */

  // --- ТЕКУЩИЙ MOCK ---
  const stored = getStoredTheme()
  return stored ?? getInitialTheme()
}

export const saveThemePreference = async (theme: AppTheme): Promise<void> => {
  // --- БУДУЩИЙ API ---
  /*
  await fetch(THEME_API_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ theme }),
  })
  */

  // --- ТЕКУЩИЙ MOCK ---
  setStoredTheme(theme)
}
