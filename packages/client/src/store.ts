import {
  useDispatch as useDispatchBase,
  useSelector as useSelectorBase,
  TypedUseSelectorHook,
  useStore as useStoreBase,
} from 'react-redux'
import { combineReducers } from 'redux'
import { configureStore, PreloadedState } from '@reduxjs/toolkit'

import friendsReducer from './slices/friendsSlice'
import gameReducer from './slices/gameSlice'
import userReducer from './slices/userSlice'
import themeReducer from './slices/themeSlice'
import leaderboardReducer from './slices/leaderboardSlice'
import forumReducer from './slices/forumSlice'

declare global {
  interface Window {
    APP_INITIAL_STATE: RootState
  }
}

export const reducer = combineReducers({
  friends: friendsReducer,
  game: gameReducer,
  user: userReducer,
  theme: themeReducer,
  leaderboard: leaderboardReducer,
  forum: forumReducer,
})

export type RootState = ReturnType<typeof reducer>

export const createAppStore = (preloadedState?: PreloadedState<RootState>) =>
  configureStore({
    reducer,
    preloadedState,
  })

export const store = createAppStore(
  typeof window === 'undefined' ? undefined : window.APP_INITIAL_STATE
)

export type AppStore = ReturnType<typeof createAppStore>
export type AppDispatch = typeof store.dispatch

export const useDispatch: () => AppDispatch = useDispatchBase
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorBase
export const useStore: () => AppStore = useStoreBase
