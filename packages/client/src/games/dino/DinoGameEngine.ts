import { GAME_HEIGHT, GAME_WIDTH, SPRITE_SCALE, START_LIVES, WORLD_SPEED } from './constants'
import { createCactusObstacle, createDino, Dino, Obstacle, Cloud } from './entities'
import { Vec2 } from './types'
import { createInputState, InputState } from './input'
import {
  CactusVariant,
  checkCollision,
  consumeJumpInput,
  getDinoHitbox,
  getGroundY,
  pickCactusVariantIndex,
  resizeWorldLayout,
  stepBirdAnimation,
  stepClouds,
  stepCollisionState,
  stepObstacles,
  stepRunAnimation,
  updateDinoPhysics,
} from './logic'

export type GameState = {
  width: number
  height: number
  dino: Dino
  score: number
  isGameOver: boolean
  obstacles: Obstacle[]
  nextObstacleIn: number
  clouds: Cloud[]
  nextCloudIn: number
  groundOffset: number
  runAnimationElapsed: number
  runFrameCursor: number
  birdAnimationElapsed: number
  birdFrameCursor: number
  lives: number
  invincibleLeft: number
  blinkElapsed: number
  blinkVisible: boolean
}

export type ReadonlyVec2 = Readonly<Vec2>

export type ReadonlyDino = Omit<Dino, 'position'> & {
  readonly position: ReadonlyVec2
}

export type ReadonlyObstacle =
  | (Omit<Extract<Obstacle, { kind: 'cactus' }>, 'position'> & { readonly position: ReadonlyVec2 })
  | (Omit<Extract<Obstacle, { kind: 'bird' }>, 'position'> & { readonly position: ReadonlyVec2 })

export type ReadonlyCloud = Omit<Cloud, 'position'> & {
  readonly position: ReadonlyVec2
}

export type ReadonlyGameState = Omit<GameState, 'dino' | 'obstacles' | 'clouds'> & {
  readonly dino: ReadonlyDino
  readonly obstacles: readonly ReadonlyObstacle[]
  readonly clouds: readonly ReadonlyCloud[]
}

type EngineDeps = {
  random: () => number
}

export type EngineEvent =
  | {
      type: 'score'
      value: number
    }
  | {
      type: 'gameover'
      value: number
    }

export type EngineTickResult = {
  events: readonly EngineEvent[]
}

export type DinoGameEngineOptions = {
  width?: number
  height?: number
  deps?: Partial<EngineDeps>
}

const MAX_STEP_DELTA = 0.05

export class DinoGameEngine {
  private readonly deps: EngineDeps
  private readonly input: InputState = createInputState()
  private lastEmittedScore = -1
  private stateSnapshotCache: ReadonlyGameState | null = null

  private readonly cactusVariants: CactusVariant[] = [
    { w: 40, h: 55, weight: 1 },
    { w: 30, h: 45, weight: 3 },
    { w: 50, h: 55, weight: 1 },
    { w: 25, h: 35, weight: 2 },
    { w: 30, h: 40, weight: 3 },
  ]

  private _state: GameState

  constructor(options: DinoGameEngineOptions = {}) {
    this.deps = {
      random: options.deps?.random ?? Math.random,
    }

    this._state = this.createInitialState(
      options.width ?? GAME_WIDTH,
      options.height ?? GAME_HEIGHT
    )
  }

  public get state(): ReadonlyGameState {
    if (this.stateSnapshotCache) {
      return this.stateSnapshotCache
    }

    const snapshot = this.buildReadonlySnapshot(this._state)
    const typedSnapshot = snapshot as unknown as ReadonlyGameState
    this.stateSnapshotCache = typedSnapshot

    return typedSnapshot
  }

  public getGroundY() {
    return getGroundY(this._state.height)
  }

  public requestJump() {
    this.input.jumpRequested = true
  }

  public reset(): EngineTickResult {
    this.stateSnapshotCache = null
    this._state = this.createInitialState(this._state.width, this._state.height)

    this.lastEmittedScore = -1
    return this.flushScoreEvents()
  }

  public resize(width: number, height: number) {
    this.stateSnapshotCache = null
    const nextLayout = resizeWorldLayout({
      dino: this._state.dino,
      obstacles: this._state.obstacles,
      oldHeight: this._state.height,
      newHeight: height,
    })

    this._state = {
      ...this._state,
      width,
      height,
      dino: nextLayout.dino,
      obstacles: nextLayout.obstacles,
    }
  }

  public step(delta: number): EngineTickResult {
    this.stateSnapshotCache = null
    const safeDelta = this.normalizeDelta(delta)
    if (safeDelta === null) {
      return { events: [] }
    }

    if (this._state.isGameOver) {
      return { events: [] }
    }

    const events: EngineEvent[] = []
    const groundY = this.getGroundY()

    this._state.score += safeDelta * 10
    this.pushScoreEvents(events)

    consumeJumpInput(this._state.dino, this.input)
    updateDinoPhysics(this._state.dino, safeDelta, groundY)

    const obstaclesStep = stepObstacles({
      obstacles: this._state.obstacles,
      nextObstacleIn: this._state.nextObstacleIn,
      width: this._state.width,
      groundY,
      delta: safeDelta,
      score: this._state.score,
      scale: SPRITE_SCALE,
      cactusVariants: this.cactusVariants,
      random: this.deps.random,
    })

    this._state.obstacles = obstaclesStep.obstacles
    this._state.nextObstacleIn = obstaclesStep.nextObstacleIn
    if (obstaclesStep.scoreBonus > 0) {
      this._state.score += obstaclesStep.scoreBonus
      this.pushScoreEvents(events)
    }

    const birdAnim = stepBirdAnimation(
      this._state.birdAnimationElapsed,
      this._state.birdFrameCursor,
      safeDelta
    )
    this._state.birdAnimationElapsed = birdAnim.elapsed
    this._state.birdFrameCursor = birdAnim.frameCursor

    const cloudsStep = stepClouds(
      this._state.clouds,
      this._state.nextCloudIn,
      this._state.width,
      safeDelta,
      this.deps.random
    )
    this._state.clouds = cloudsStep.clouds
    this._state.nextCloudIn = cloudsStep.nextCloudIn

    this._state.groundOffset += WORLD_SPEED * safeDelta

    const collision = stepCollisionState(
      {
        isGameOver: this._state.isGameOver,
        invincibleLeft: this._state.invincibleLeft,
        blinkElapsed: this._state.blinkElapsed,
        blinkVisible: this._state.blinkVisible,
        lives: this._state.lives,
      },
      safeDelta,
      this.checkCollision()
    )

    this._state.isGameOver = collision.isGameOver
    this._state.invincibleLeft = collision.invincibleLeft
    this._state.blinkElapsed = collision.blinkElapsed
    this._state.blinkVisible = collision.blinkVisible
    this._state.lives = collision.lives

    const runAnim = stepRunAnimation(
      this._state.dino.isOnGround,
      this._state.runAnimationElapsed,
      this._state.runFrameCursor,
      safeDelta
    )
    this._state.runAnimationElapsed = runAnim.elapsed
    this._state.runFrameCursor = runAnim.frameCursor

    if (collision.gameOverTriggered) {
      events.push({ type: 'gameover', value: Math.floor(this._state.score) })
    }

    return { events }
  }

  private checkCollision() {
    if (this._state.isGameOver || this._state.invincibleLeft > 0) {
      return false
    }

    return checkCollision(getDinoHitbox(this._state.dino), this._state.obstacles)
  }

  private pickCactusVariantIndex() {
    return pickCactusVariantIndex(this.cactusVariants, this.deps.random)
  }

  private createInitialState(width: number, height: number): GameState {
    const groundY = getGroundY(height)
    const dino = createDino(groundY)
    const id = this.pickCactusVariantIndex()
    const v = this.cactusVariants[id]

    return {
      width,
      height,
      dino,
      score: 0,
      isGameOver: false,
      obstacles: [createCactusObstacle(width + 200, groundY, id, v.w, v.h, SPRITE_SCALE)],
      nextObstacleIn: 0.8,
      clouds: [],
      nextCloudIn: 0.2,
      groundOffset: 0,
      runAnimationElapsed: 0,
      runFrameCursor: 0,
      birdAnimationElapsed: 0,
      birdFrameCursor: 0,
      lives: START_LIVES,
      invincibleLeft: 0,
      blinkElapsed: 0,
      blinkVisible: true,
    }
  }

  private normalizeDelta(delta: number): number | null {
    if (!Number.isFinite(delta) || delta < 0) {
      return null
    }

    return Math.min(delta, MAX_STEP_DELTA)
  }

  private buildReadonlySnapshot(state: GameState) {
    const dino = Object.freeze({
      ...state.dino,
      position: Object.freeze({ ...state.dino.position }),
    })
    const obstacles = Object.freeze(
      state.obstacles.map(o =>
        Object.freeze({
          ...o,
          position: Object.freeze({ ...o.position }),
        })
      )
    )
    const clouds = Object.freeze(
      state.clouds.map(c =>
        Object.freeze({
          ...c,
          position: Object.freeze({ ...c.position }),
        })
      )
    )

    return Object.freeze({
      ...state,
      dino,
      obstacles,
      clouds,
    })
  }

  private pushScoreEvents(events: EngineEvent[]) {
    const roundedScore = Math.floor(this._state.score)
    if (roundedScore === this.lastEmittedScore) return
    this.lastEmittedScore = roundedScore
    events.push({ type: 'score', value: roundedScore })
  }

  private flushScoreEvents(): EngineTickResult {
    const events: EngineEvent[] = []
    this.pushScoreEvents(events)
    return { events }
  }
}
