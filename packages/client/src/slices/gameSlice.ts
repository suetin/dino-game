import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/store'

export type GamePhase = 'start' | 'playing' | 'game_over'

interface GameState {
  phase: GamePhase
  lastScore: number
}

const initialState: GameState = {
  phase: 'start',
  lastScore: 0,
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: state => {
      state.phase = 'playing'
    },
    finishGame: (state, action: { payload: number }) => {
      state.phase = 'game_over'
      state.lastScore = action.payload
    },
    playAgain: state => {
      state.phase = 'playing'
    },
    goToMenu: state => {
      state.phase = 'start'
    },
  },
})

export const { startGame, finishGame, playAgain, goToMenu } = gameSlice.actions

export const selectGamePhase = (state: RootState) => state.game.phase
export const selectLastScore = (state: RootState) => state.game.lastScore

export default gameSlice.reducer
