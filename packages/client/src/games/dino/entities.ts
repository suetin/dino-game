import { Vec2 } from './types'
import { CACTUS_HEIGHT, CACTUS_WIDTH, DINO_HEIGHT, GROUND_Y } from './constants'

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

export const createDino = (): Dino => ({
  position: { x: 80, y: GROUND_Y - DINO_HEIGHT },
  velocityY: 0,
  isOnGround: true,
})

export const createCactus = (x: number): Cactus => ({
  position: { x, y: GROUND_Y - CACTUS_HEIGHT },
  width: CACTUS_WIDTH,
  height: CACTUS_HEIGHT,
})
