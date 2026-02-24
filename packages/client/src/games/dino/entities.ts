import { Vec2 } from './types'
import { BIRD_HEIGHT, BIRD_WIDTH, DINO_HEIGHT } from './constants'

export type Dino = {
  position: Vec2
  velocityY: number
  isOnGround: boolean
}

export type ObstacleKind = 'cactus' | 'bird'

export type ObstacleBase = {
  kind: ObstacleKind
  position: Vec2
  width: number
  height: number
}

export type CactusObstacle = ObstacleBase & {
  kind: 'cactus'
  variant: number
}

export type BirdObstacle = ObstacleBase & {
  kind: 'bird'
  gap: number
}

export type Obstacle = CactusObstacle | BirdObstacle

export type Cloud = {
  position: Vec2
  width: number
  height: number
  scale?: number
}

export const createDino = (groundY: number): Dino => ({
  position: { x: 80, y: groundY - DINO_HEIGHT },
  velocityY: 0,
  isOnGround: true,
})

export function createCactusObstacle(
  x: number,
  groundY: number,
  variant: number,
  cWidth: number,
  cHeight: number,
  scale: number
): CactusObstacle {
  const width = cWidth * scale
  const height = cHeight * scale
  return {
    kind: 'cactus',
    variant,
    position: { x, y: groundY - height },
    width,
    height,
  }
}

export function createBirdObstacle(
  x: number,
  groundY: number,
  scale: number,
  random: () => number = Math.random
): BirdObstacle {
  const levels = [190, 220, 250]
  const levelIndex = Math.min(levels.length - 1, Math.floor(random() * levels.length))
  const gap = levels[levelIndex]

  return {
    kind: 'bird',
    gap,
    position: { x, y: groundY - BIRD_HEIGHT - gap },
    width: BIRD_WIDTH * scale,
    height: BIRD_HEIGHT * scale,
  }
}
