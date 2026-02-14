import { Vec2 } from './types'
import { CACTUS_HEIGHT, CACTUS_WIDTH, DINO_HEIGHT } from './constants'

export type Dino = {
  position: Vec2
  velocityY: number
  isOnGround: boolean
}

export type Cactus = {
  position: Vec2
  width: number
  height: number
}

export const createDino = (groundY: number): Dino => ({
  position: { x: 80, y: groundY - DINO_HEIGHT },
  velocityY: 0,
  isOnGround: true,
})

export const createCactus = (x: number, groundY: number): Cactus => ({
  position: { x, y: groundY - CACTUS_HEIGHT },
  width: CACTUS_WIDTH,
  height: CACTUS_HEIGHT,
})
