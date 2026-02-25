import {
  BIRD_ANIMATION_FPS,
  BIRD_FRAME_COUNT,
  BIRD_HITBOX_INSET_BOTTOM,
  BIRD_HITBOX_INSET_LEFT,
  BIRD_HITBOX_INSET_RIGHT,
  BIRD_HITBOX_INSET_TOP,
  BIRD_SPEED_MULTIPLIER,
  CACTUS_HITBOX_INSET_BOTTOM,
  CACTUS_HITBOX_INSET_LEFT,
  CACTUS_HITBOX_INSET_RIGHT,
  CACTUS_HITBOX_INSET_TOP,
  CLOUD_HEIGHT,
  CLOUD_SPAWN_MAX,
  CLOUD_SPAWN_MIN,
  CLOUD_SPEED,
  CLOUD_WIDTH,
  CLOUD_Y_MAX,
  CLOUD_Y_MIN,
  DINO_ANIMATION_FPS,
  DINO_BLINK_FPS,
  DINO_HEIGHT,
  DINO_HITBOX_INSET_BOTTOM,
  DINO_HITBOX_INSET_LEFT,
  DINO_HITBOX_INSET_RIGHT,
  DINO_HITBOX_INSET_TOP,
  DINO_RUN_FRAME_INDICES,
  DINO_WIDTH,
  GRAVITY,
  INVINCIBLE_TIME,
  JUMP_VELOCITY,
  WORLD_SPEED,
} from './constants'
import { Cloud, createBirdObstacle, createCactusObstacle, Dino, Obstacle } from './entities'
import { InputState } from './input'

export type Rect = {
  left: number
  right: number
  top: number
  bottom: number
}

export type CactusVariant = {
  w: number
  h: number
  weight: number
}

export type CollisionState = {
  isGameOver: boolean
  invincibleLeft: number
  blinkElapsed: number
  blinkVisible: boolean
  lives: number
}

export type CollisionStepResult = CollisionState & {
  gameOverTriggered: boolean
}

export type ObstacleStepResult = {
  obstacles: Obstacle[]
  nextObstacleIn: number
  scoreBonus: number
}

export type CloudStepResult = {
  clouds: Cloud[]
  nextCloudIn: number
}

export type AnimationStepResult = {
  elapsed: number
  frameCursor: number
}

export type ResizeWorldLayoutParams = {
  dino: Dino
  obstacles: Obstacle[]
  oldHeight: number
  newHeight: number
}

export type ResizeWorldLayoutResult = {
  dino: Dino
  obstacles: Obstacle[]
}

export function getGroundY(height: number) {
  return Math.max(DINO_HEIGHT + 20, height - 60)
}

export function consumeJumpInput(dino: Dino, input: InputState) {
  if (input.jumpRequested && dino.isOnGround) {
    dino.velocityY = -JUMP_VELOCITY
    dino.isOnGround = false
  }

  input.jumpRequested = false
}

export function updateDinoPhysics(dino: Dino, delta: number, groundY: number) {
  dino.velocityY += GRAVITY * delta
  dino.position.y += dino.velocityY * delta

  if (dino.position.y >= groundY - DINO_HEIGHT) {
    dino.position.y = groundY - DINO_HEIGHT
    dino.velocityY = 0
    dino.isOnGround = true
  }
}

export function stepClouds(
  clouds: Cloud[],
  nextCloudIn: number,
  width: number,
  delta: number,
  random: () => number = Math.random
): CloudStepResult {
  const movedClouds = clouds
    .map(c => ({
      ...c,
      position: { ...c.position, x: c.position.x - CLOUD_SPEED * delta },
    }))
    .filter(c => c.position.x + c.width > 0)

  let next = nextCloudIn - delta
  if (next > 0) {
    return { clouds: movedClouds, nextCloudIn: next }
  }

  const x = width + 20
  const y = CLOUD_Y_MIN + random() * (CLOUD_Y_MAX - CLOUD_Y_MIN)
  const scale = 5 + random() * 0.8

  next = CLOUD_SPAWN_MIN + random() * (CLOUD_SPAWN_MAX - CLOUD_SPAWN_MIN)

  return {
    clouds: [
      ...movedClouds,
      {
        position: { x, y },
        width: CLOUD_WIDTH,
        height: CLOUD_HEIGHT,
        scale,
      },
    ],
    nextCloudIn: next,
  }
}

export function pickCactusVariantIndex(
  cactusVariants: CactusVariant[],
  random: () => number = Math.random
) {
  const total = cactusVariants.reduce((s, v) => s + v.weight, 0)
  let r = random() * total

  for (let i = 0; i < cactusVariants.length; i++) {
    r -= cactusVariants[i].weight
    if (r <= 0) return i
  }

  return 0
}

export function stepObstacles(params: {
  obstacles: Obstacle[]
  nextObstacleIn: number
  width: number
  groundY: number
  delta: number
  score: number
  scale: number
  cactusVariants: CactusVariant[]
  random?: () => number
  pickVariantIndex?: () => number
}): ObstacleStepResult {
  const {
    obstacles,
    nextObstacleIn,
    width,
    groundY,
    delta,
    score,
    scale,
    cactusVariants,
    random = Math.random,
    pickVariantIndex = () => pickCactusVariantIndex(cactusVariants, random),
  } = params

  const moved = obstacles
    .map(o => {
      const speed = o.kind === 'bird' ? WORLD_SPEED * BIRD_SPEED_MULTIPLIER : WORLD_SPEED
      return {
        ...o,
        position: { ...o.position, x: o.position.x - speed * delta },
      }
    })
    .filter(o => o.position.x + o.width > 0)

  const next = nextObstacleIn - delta
  if (next > 0) {
    return { obstacles: moved, nextObstacleIn: next, scoreBonus: 0 }
  }

  const MIN_GAP_PX = 280
  const last = moved[moved.length - 1]
  if (last && last.position.x > width - MIN_GAP_PX) {
    return { obstacles: moved, nextObstacleIn: next, scoreBonus: 0 }
  }

  const spawnX = width + 150 + random() * 200
  const canSpawnBird = score >= 30
  const roll = random()
  const id = pickVariantIndex()
  const v = cactusVariants[id]

  const nextObstacle =
    canSpawnBird && roll < 0.35
      ? createBirdObstacle(spawnX, groundY, scale, random)
      : createCactusObstacle(spawnX, groundY, id, v.w, v.h, scale)

  return {
    obstacles: [...moved, nextObstacle],
    nextObstacleIn: 1.1 + random() * 0.9,
    scoreBonus: 1,
  }
}

export function stepBirdAnimation(
  birdAnimationElapsed: number,
  birdFrameCursor: number,
  delta: number
): AnimationStepResult {
  let elapsed = birdAnimationElapsed + delta
  let frameCursor = birdFrameCursor
  const frameDuration = 1 / BIRD_ANIMATION_FPS

  while (elapsed >= frameDuration) {
    elapsed -= frameDuration
    frameCursor = (frameCursor + 1) % BIRD_FRAME_COUNT
  }

  return { elapsed, frameCursor }
}

export function stepRunAnimation(
  isOnGround: boolean,
  runAnimationElapsed: number,
  runFrameCursor: number,
  delta: number
): AnimationStepResult {
  if (!isOnGround) {
    return { elapsed: runAnimationElapsed, frameCursor: runFrameCursor }
  }

  let elapsed = runAnimationElapsed + delta
  let frameCursor = runFrameCursor
  const frameDuration = 1 / DINO_ANIMATION_FPS

  while (elapsed >= frameDuration) {
    elapsed -= frameDuration
    frameCursor = (frameCursor + 1) % DINO_RUN_FRAME_INDICES.length
  }

  return { elapsed, frameCursor }
}

export function getDinoHitbox(dino: Dino): Rect {
  return {
    left: dino.position.x + DINO_WIDTH * DINO_HITBOX_INSET_LEFT,
    right: dino.position.x + DINO_WIDTH * (1 - DINO_HITBOX_INSET_RIGHT),
    top: dino.position.y + DINO_HEIGHT * DINO_HITBOX_INSET_TOP,
    bottom: dino.position.y + DINO_HEIGHT * (1 - DINO_HITBOX_INSET_BOTTOM),
  }
}

export function getObstacleHitbox(o: Obstacle): Rect {
  if (o.kind === 'cactus') {
    return {
      left: o.position.x + o.width * CACTUS_HITBOX_INSET_LEFT,
      right: o.position.x + o.width * (1 - CACTUS_HITBOX_INSET_RIGHT),
      top: o.position.y + o.height * CACTUS_HITBOX_INSET_TOP,
      bottom: o.position.y + o.height * (1 - CACTUS_HITBOX_INSET_BOTTOM),
    }
  }

  return {
    left: o.position.x + o.width * BIRD_HITBOX_INSET_LEFT,
    right: o.position.x + o.width * (1 - BIRD_HITBOX_INSET_RIGHT),
    top: o.position.y + o.height * BIRD_HITBOX_INSET_TOP,
    bottom: o.position.y + o.height * (1 - BIRD_HITBOX_INSET_BOTTOM),
  }
}

export function intersects(a: Rect, b: Rect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

export function checkCollision(dinoHitbox: Rect, obstacles: Obstacle[]) {
  for (const o of obstacles) {
    if (intersects(dinoHitbox, getObstacleHitbox(o))) {
      return true
    }
  }

  return false
}

export function stepCollisionState(
  state: CollisionState,
  delta: number,
  collided: boolean
): CollisionStepResult {
  if (state.isGameOver) {
    return { ...state, gameOverTriggered: false }
  }

  if (state.invincibleLeft > 0) {
    const invincibleLeft = Math.max(0, state.invincibleLeft - delta)
    let blinkElapsed = state.blinkElapsed + delta
    let blinkVisible = state.blinkVisible
    const blinkStep = 1 / DINO_BLINK_FPS

    while (blinkElapsed >= blinkStep) {
      blinkElapsed -= blinkStep
      blinkVisible = !blinkVisible
    }

    if (invincibleLeft === 0) {
      blinkVisible = true
    }

    return {
      ...state,
      invincibleLeft,
      blinkElapsed,
      blinkVisible,
      gameOverTriggered: false,
    }
  }

  if (!collided) {
    return { ...state, gameOverTriggered: false }
  }

  const lives = state.lives - 1
  if (lives <= 0) {
    return {
      ...state,
      lives,
      isGameOver: true,
      gameOverTriggered: true,
    }
  }

  return {
    ...state,
    lives,
    invincibleLeft: INVINCIBLE_TIME,
    blinkElapsed: 0,
    blinkVisible: false,
    gameOverTriggered: false,
  }
}

export function resizeWorldLayout(params: ResizeWorldLayoutParams): ResizeWorldLayoutResult {
  const { dino, obstacles, oldHeight, newHeight } = params
  const oldGroundY = getGroundY(oldHeight)
  const newGroundY = getGroundY(newHeight)
  const dinoOffsetFromGround = oldGroundY - dino.position.y

  const nextDino: Dino = {
    ...dino,
    position: { ...dino.position, y: newGroundY - dinoOffsetFromGround },
  }

  if (nextDino.position.y >= newGroundY - DINO_HEIGHT) {
    nextDino.position.y = newGroundY - DINO_HEIGHT
    nextDino.velocityY = 0
    nextDino.isOnGround = true
  }

  const nextObstacles = obstacles.map(o => {
    const y = o.kind === 'cactus' ? newGroundY - o.height : newGroundY - o.height - o.gap
    return {
      ...o,
      position: { ...o.position, y },
    }
  })

  return { dino: nextDino, obstacles: nextObstacles }
}
