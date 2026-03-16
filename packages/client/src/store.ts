import {
  useDispatch as useDispatchBase,
  useSelector as useSelectorBase,
  TypedUseSelectorHook,
  useStore as useStoreBase,
} from 'react-redux'
import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

import friendsReducer from './slices/friendsSlice'
import gameReducer from './slices/gameSlice'
import ssrReducer from './slices/ssrSlice'
import userReducer from './slices/userSlice'
import themeReducer from './slices/themeSlice'
import leaderboardReducer from './slices/leaderboardSlice'

declare global {
  interface Window {
    APP_INITIAL_STATE: RootState
  }
}

export const reducer = combineReducers({
  friends: friendsReducer,
  game: gameReducer,
  ssr: ssrReducer,
  user: userReducer,
  theme: themeReducer,
  leaderboard: leaderboardReducer,
})

export const store = configureStore({
  reducer,
  preloadedState: typeof window === 'undefined' ? undefined : window.APP_INITIAL_STATE,
})

export type RootState = ReturnType<typeof reducer>
export type AppDispatch = typeof store.dispatch

export const useDispatch: () => AppDispatch = useDispatchBase
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorBase
export const useStore: () => typeof store = useStoreBase
