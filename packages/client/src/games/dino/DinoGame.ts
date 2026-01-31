import {
  DINO_HEIGHT,
  DINO_WIDTH,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  GROUND_Y,
  JUMP_VELOCITY,
  WORLD_SPEED,
} from './constants'
import { Cactus, createCactus, createDino, Dino } from './entities'
import { createInputState } from './input'

export type DinoGameOptions = {
  width?: number
  height?: number
}

export class DinoGame {
  private readonly ctx: CanvasRenderingContext2D
  private readonly input = createInputState()
  private width: number
  private height: number
  private lastTime = 0
  private rafId = 0

  private dino: Dino = createDino()
  private cactus: Cactus = createCactus(GAME_WIDTH + 200)
  private score = 0
  private isRunning = false

  constructor(ctx: CanvasRenderingContext2D, options: DinoGameOptions = {}) {
    this.ctx = ctx
    this.width = options.width ?? GAME_WIDTH
    this.height = options.height ?? GAME_HEIGHT
  }

  public start() {
    if (this.isRunning) return
    this.isRunning = true
    this.lastTime = performance.now()
    this.loop(this.lastTime)
  }

  public stop() {
    this.isRunning = false
    cancelAnimationFrame(this.rafId)
  }

  public requestJump() {
    this.input.jumpRequested = true
  }

  public reset() {
    this.dino = createDino()
    this.cactus = createCactus(this.width + 200)
    this.score = 0
  }

  public resize(width: number, height: number) {
    this.width = width
    this.height = height
  }

  private loop = (time: number) => {
    const delta = Math.min((time - this.lastTime) / 1000, 0.05)
    this.lastTime = time

    this.update(delta)
    this.render()

    if (this.isRunning) {
      this.rafId = requestAnimationFrame(this.loop)
    }
  }

  private update(delta: number) {
    if (this.input.jumpRequested && this.dino.isOnGround) {
      this.dino.velocityY = -JUMP_VELOCITY
      this.dino.isOnGround = false
    }
    this.input.jumpRequested = false

    this.dino.velocityY += GRAVITY * delta
    this.dino.position.y += this.dino.velocityY * delta

    if (this.dino.position.y >= GROUND_Y - DINO_HEIGHT) {
      this.dino.position.y = GROUND_Y - DINO_HEIGHT
      this.dino.velocityY = 0
      this.dino.isOnGround = true
    }

    this.cactus.position.x -= WORLD_SPEED * delta
    if (this.cactus.position.x + this.cactus.width < 0) {
      this.cactus = createCactus(this.width + 150 + Math.random() * 200)
      this.score += 1
    }
  }

  private render() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)

    ctx.fillStyle = '#f7f5f0'
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.strokeStyle = '#3b3b3b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, GROUND_Y)
    ctx.lineTo(this.width, GROUND_Y)
    ctx.stroke()

    ctx.fillStyle = '#2f2f2f'
    ctx.fillRect(
      this.dino.position.x,
      this.dino.position.y,
      DINO_WIDTH,
      DINO_HEIGHT
    )

    ctx.fillStyle = '#0e8a5a'
    ctx.fillRect(
      this.cactus.position.x,
      this.cactus.position.y,
      this.cactus.width,
      this.cactus.height
    )

    ctx.fillStyle = '#1a1a1a'
    ctx.font = '16px monospace'
    ctx.fillText(`Score: ${this.score}`, 16, 24)
  }
}
