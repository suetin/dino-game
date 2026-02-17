export type DinoGameThemeMode = 'light' | 'dark'

export type DinoGameThemeTokens = {
  mode: DinoGameThemeMode
  backgroundColor: string
  groundColor: string
  uiTextColor: string
}

export const DINO_GAME_LIGHT_THEME: DinoGameThemeTokens = {
  mode: 'light',
  backgroundColor: '#f7f5f0',
  groundColor: '#3b3b3b',
  uiTextColor: '#503a2c',
}

export const DINO_GAME_DARK_THEME: DinoGameThemeTokens = {
  mode: 'dark',
  backgroundColor: '#232638',
  groundColor: '#9aa4b2',
  uiTextColor: '#e5e7eb',
}

export const getDinoGameThemeTokens = (isDarkMode: boolean): DinoGameThemeTokens =>
  isDarkMode ? DINO_GAME_DARK_THEME : DINO_GAME_LIGHT_THEME
