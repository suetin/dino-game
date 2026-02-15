import {
  CACTUS_HITBOX_INSET_BOTTOM,
  CACTUS_HITBOX_INSET_LEFT,
  CACTUS_HITBOX_INSET_RIGHT,
  CACTUS_HITBOX_INSET_TOP,
  DINO_ANIMATION_FPS,
  DINO_DEAD_FRAME_INDEX,
  DINO_DEAD_SPRITE_SOURCE_WIDTH,
  DINO_HEIGHT,
  DINO_HITBOX_INSET_BOTTOM,
  DINO_HITBOX_INSET_LEFT,
  DINO_HITBOX_INSET_RIGHT,
  DINO_HITBOX_INSET_TOP,
  DINO_JUMP_FRAME_INDEX,
  DINO_RUN_FRAME_INDICES,
  DINO_SPRITE_FIRST_FRAME_Y,
  DINO_SPRITE_FRAME_HEIGHT,
  DINO_SPRITE_FRAME_STRIDE_Y,
  DINO_SPRITE_SOURCE_WIDTH,
  DINO_SPRITE_SOURCE_X,
  DINO_WIDTH,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  JUMP_VELOCITY,
  UI_TEXT_COLOR,
  UI_TEXT_SCALE,
  WORLD_SPEED,
} from './constants'
import { Cactus, createCactus, createDino, Dino } from './entities'
import { createInputState } from './input'
import mitt, { Emitter } from 'mitt'
import dinoSpriteUrl from '../../assets/dino_sprite.png'
import cactusSpriteUrl from '../../assets/cactus_1.png'

type DinoGameEvents = {
  score: number
  gameover: number
}

type Rect = {
  left: number
  right: number
  top: number
  bottom: number
}

export type DinoGameOptions = {
  width?: number
  height?: number
}

export class DinoGame {
  private readonly ctx: CanvasRenderingContext2D
  private readonly input = createInputState()
  private readonly emitter: Emitter<DinoGameEvents> = mitt<DinoGameEvents>()

  private width: number
  private height: number
  private lastTime = 0
  private rafId = 0

  private dino: Dino
  private cactus: Cactus
  private score = 0
  private isRunning = false
  private isGameOver = false
  private lastEmittedScore = -1

  private readonly dinoSprite = new Image()
  private isDinoSpriteReady = false
  private readonly cactusSprite = new Image()
  private isCactusSpriteReady = false

  private runAnimationElapsed = 0
  private runFrameCursor = 0

  constructor(ctx: CanvasRenderingContext2D, options: DinoGameOptions = {}) {
    this.ctx = ctx
    this.width = options.width ?? GAME_WIDTH
    this.height = options.height ?? GAME_HEIGHT

    this.dino = createDino(this.getGroundY())
    this.cactus = createCactus(this.width + 200, this.getGroundY())

    this.setupSprites()
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

  public reset() {
    this.resetWorld()
    this.emitScore()
  }

  public resize(width: number, height: number) {
    const oldGroundY = this.getGroundY()
    const dinoOffsetFromGround = oldGroundY - this.dino.position.y

    this.width = width
    this.height = height

    const newGroundY = this.getGroundY()
    this.dino.position.y = newGroundY - dinoOffsetFromGround

    if (this.dino.position.y >= newGroundY - DINO_HEIGHT) {
      this.dino.position.y = newGroundY - DINO_HEIGHT
      this.dino.velocityY = 0
      this.dino.isOnGround = true
    }

    this.cactus.position.y = newGroundY - this.cactus.height
  }

  public requestJump() {
    this.input.jumpRequested = true
  }

  public renderStartHint() {
    this.render(true)
  }

  public on<Event extends keyof DinoGameEvents>(
    type: Event,
    handler: (event: DinoGameEvents[Event]) => void
  ) {
    this.emitter.on(type, handler)
  }

  public off<Event extends keyof DinoGameEvents>(
    type: Event,
    handler: (event: DinoGameEvents[Event]) => void
  ) {
    this.emitter.off(type, handler)
  }

  private setupSprites() {
    this.loadSprite(this.dinoSprite, dinoSpriteUrl, () => {
      this.isDinoSpriteReady = true
    })

    this.loadSprite(this.cactusSprite, cactusSpriteUrl, () => {
      this.isCactusSpriteReady = true
    })
  }

  private loadSprite(image: HTMLImageElement, url: string, onLoad: () => void) {
    image.onload = () => {
      onLoad()
      if (!this.isRunning) {
        this.renderStartHint()
      }
    }
    image.onerror = () => {
      console.error('Не удалось загрузить спрайт:', url)
    }
    image.src = url
  }

  private resetWorld() {
    const groundY = this.getGroundY()
    this.dino = createDino(groundY)
    this.cactus = createCactus(this.width + 200, groundY)
    this.score = 0
    this.isGameOver = false
    this.runAnimationElapsed = 0
    this.runFrameCursor = 0
  }

  private loop = (time: number) => {
    const delta = Math.min((time - this.lastTime) / 1000, 0.05)
    this.lastTime = time

    this.update(delta)
    this.render(false)

    if (this.isRunning) {
      this.rafId = requestAnimationFrame(this.loop)
    }
  }

  private update(delta: number) {
    if (this.isGameOver) return

    const groundY = this.getGroundY()

    this.updateScore(delta)
    this.consumeJumpInput()
    this.updateDino(delta, groundY)
    this.updateCactus(delta, groundY)

    if (this.checkCollision()) {
      this.isGameOver = true
      this.emitter.emit('gameover', Math.floor(this.score))
      return
    }

    this.updateRunAnimation(delta)
  }

  private updateScore(delta: number) {
    this.score += delta * 10
    this.emitScore()
  }

  private consumeJumpInput() {
    if (this.input.jumpRequested && this.dino.isOnGround) {
      this.dino.velocityY = -JUMP_VELOCITY
      this.dino.isOnGround = false
    }
    this.input.jumpRequested = false
  }

  private updateDino(delta: number, groundY: number) {
    this.dino.velocityY += GRAVITY * delta
    this.dino.position.y += this.dino.velocityY * delta

    if (this.dino.position.y >= groundY - DINO_HEIGHT) {
      this.dino.position.y = groundY - DINO_HEIGHT
      this.dino.velocityY = 0
      this.dino.isOnGround = true
    }
  }

  private updateCactus(delta: number, groundY: number) {
    this.cactus.position.x -= WORLD_SPEED * delta

    if (this.cactus.position.x + this.cactus.width >= 0) {
      return
    }

    this.cactus = createCactus(this.width + 150 + Math.random() * 200, groundY)
    this.score += 1
    this.emitScore()
  }

  private checkCollision() {
    const dino = this.getDinoHitbox()
    const cactus = this.getCactusHitbox()

    return (
      dino.left < cactus.right &&
      dino.right > cactus.left &&
      dino.top < cactus.bottom &&
      dino.bottom > cactus.top
    )
  }

  private getDinoHitbox(): Rect {
    return {
      left: this.dino.position.x + DINO_WIDTH * DINO_HITBOX_INSET_LEFT,
      right: this.dino.position.x + DINO_WIDTH * (1 - DINO_HITBOX_INSET_RIGHT),
      top: this.dino.position.y + DINO_HEIGHT * DINO_HITBOX_INSET_TOP,
      bottom: this.dino.position.y + DINO_HEIGHT * (1 - DINO_HITBOX_INSET_BOTTOM),
    }
  }

  private getCactusHitbox(): Rect {
    return {
      left: this.cactus.position.x + this.cactus.width * CACTUS_HITBOX_INSET_LEFT,
      right: this.cactus.position.x + this.cactus.width * (1 - CACTUS_HITBOX_INSET_RIGHT),
      top: this.cactus.position.y + this.cactus.height * CACTUS_HITBOX_INSET_TOP,
      bottom: this.cactus.position.y + this.cactus.height * (1 - CACTUS_HITBOX_INSET_BOTTOM),
    }
  }

  private emitScore() {
    const roundedScore = Math.floor(this.score)
    if (roundedScore === this.lastEmittedScore) return

    this.lastEmittedScore = roundedScore
    this.emitter.emit('score', roundedScore)
  }

  private render(showStartHint: boolean) {
    const groundY = this.getGroundY()

    this.renderBackground(groundY)
    this.renderDino()
    this.renderCactus()
    this.renderHud()
    this.renderOverlay(showStartHint)
  }

  private renderBackground(groundY: number) {
    const ctx = this.ctx

    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillStyle = '#f7f5f0'
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.strokeStyle = '#3b3b3b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, groundY)
    ctx.lineTo(this.width, groundY)
    ctx.stroke()
  }

  private renderHud() {
    const ctx = this.ctx

    ctx.fillStyle = UI_TEXT_COLOR
    ctx.font = `${16 * UI_TEXT_SCALE}px monospace`
    ctx.fillText(`Очки: ${Math.floor(this.score)}`, 16, 24 * UI_TEXT_SCALE)
  }

  private renderOverlay(showStartHint: boolean) {
    const ctx = this.ctx

    if (this.isGameOver) {
      ctx.fillStyle = UI_TEXT_COLOR
      ctx.textAlign = 'center'
      ctx.font = `${24 * UI_TEXT_SCALE}px monospace`
      ctx.fillText('Конец игры', this.width / 2, this.height / 2)
      ctx.font = `${14 * UI_TEXT_SCALE}px monospace`
      ctx.fillText('Нажмите R для рестарта', this.width / 2, this.height / 2 + 24 * UI_TEXT_SCALE)
      ctx.textAlign = 'start'
      return
    }

    if (!showStartHint) {
      return
    }

    ctx.fillStyle = UI_TEXT_COLOR
    ctx.textAlign = 'center'
    ctx.font = `${14 * UI_TEXT_SCALE}px monospace`
    ctx.fillText('Кликни или нажми Пробел', this.width / 2, this.height / 2)
    ctx.textAlign = 'start'
  }

  private getGroundY() {
    return Math.max(DINO_HEIGHT + 20, this.height - 60)
  }

  private updateRunAnimation(delta: number) {
    if (!this.dino.isOnGround) return

    this.runAnimationElapsed += delta
    const frameDuration = 1 / DINO_ANIMATION_FPS

    while (this.runAnimationElapsed >= frameDuration) {
      this.runAnimationElapsed -= frameDuration
      this.runFrameCursor = (this.runFrameCursor + 1) % DINO_RUN_FRAME_INDICES.length
    }
  }

  private getCurrentDinoFrameIndex() {
    if (this.isGameOver) {
      return DINO_DEAD_FRAME_INDEX
    }

    if (!this.dino.isOnGround) {
      return DINO_JUMP_FRAME_INDEX
    }

    return DINO_RUN_FRAME_INDICES[this.runFrameCursor]
  }

  private renderDino() {
    const ctx = this.ctx

    if (!this.isDinoSpriteReady) {
      ctx.fillStyle = '#2f2f2f'
      ctx.fillRect(this.dino.position.x, this.dino.position.y, DINO_WIDTH, DINO_HEIGHT)
      return
    }

    const frameIndex = this.getCurrentDinoFrameIndex()
    const sourceX = DINO_SPRITE_SOURCE_X
    const sourceY = DINO_SPRITE_FIRST_FRAME_Y + frameIndex * DINO_SPRITE_FRAME_STRIDE_Y
    const sourceHeight = DINO_SPRITE_FRAME_HEIGHT
    const maxSourceWidth =
      frameIndex === DINO_DEAD_FRAME_INDEX
        ? DINO_DEAD_SPRITE_SOURCE_WIDTH
        : DINO_SPRITE_SOURCE_WIDTH
    const sourceWidth = Math.min(maxSourceWidth, this.dinoSprite.width - sourceX)

    if (sourceWidth <= 0 || sourceY + sourceHeight > this.dinoSprite.height) {
      return
    }

    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(
      this.dinoSprite,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      this.dino.position.x,
      this.dino.position.y,
      DINO_WIDTH,
      DINO_HEIGHT
    )
    ctx.restore()
  }

  private renderCactus() {
    const ctx = this.ctx

    if (!this.isCactusSpriteReady) {
      ctx.fillStyle = '#0e8a5a'
      ctx.fillRect(
        this.cactus.position.x,
        this.cactus.position.y,
        this.cactus.width,
        this.cactus.height
      )
      return
    }

    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(
      this.cactusSprite,
      0,
      0,
      this.cactusSprite.width,
      this.cactusSprite.height,
      this.cactus.position.x,
      this.cactus.position.y,
      this.cactus.width,
      this.cactus.height
    )
    ctx.restore()
  }
}
