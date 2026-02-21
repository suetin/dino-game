import {
  BIRD_ANIMATION_FPS,
  BIRD_FRAME_COUNT,
  BIRD_HITBOX_INSET_BOTTOM,
  BIRD_HITBOX_INSET_LEFT,
  BIRD_HITBOX_INSET_RIGHT,
  BIRD_HITBOX_INSET_TOP,
  BIRD_SPEED_MULTIPLIER,
  BIRD_SPRITE_FRAME_HEIGHT,
  BIRD_SPRITE_WIDTH,
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
  DIGIT_HEIGHT,
  DIGIT_WIDTH,
  DINO_ANIMATION_FPS,
  DINO_BLINK_FPS,
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
  INVINCIBLE_TIME,
  JUMP_VELOCITY,
  SPRITE_SCALE,
  START_LIVES,
  UI_TEXT_SCALE,
  WORLD_SPEED,
} from './constants'
import {
  Cloud,
  createBirdObstacle,
  createCactusObstacle,
  createDino,
  Dino,
  Obstacle,
} from './entities'
import { createInputState } from './input'
import mitt, { Emitter } from 'mitt'
import { DINO_GAME_LIGHT_THEME, DinoGameThemeTokens } from './theme'

import dinoSpriteUrl from '../../assets/images/dino/dino_sprite.png'
import cactus1SpriteUrl from '../../assets/images/obstacles/green_cactus.png'
import cactus2SpriteUrl from '../../assets/images/obstacles/big_cactus.png'
import cactus3SpriteUrl from '../../assets/images/obstacles/grouped_cactus.png'
import cactus4SpriteUrl from '../../assets/images/obstacles/medium_cactus.png'
import cactus5SpriteUrl from '../../assets/images/obstacles/small_cactus.png'
import groundLongSrc from '../../assets/images/background/road.png'
import cloudSpriteUrl from '../../assets/images/background/cloud.png'
import birdSpriteUrl from '../../assets/images/obstacles/bird.png'
import heartUrl from '../../assets/images/HUD/heart.png'
import digitsUrl from '../../assets/images/HUD/numbers.png'

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
  theme?: DinoGameThemeTokens
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
  private score = 0
  private isRunning = false
  private isGameOver = false
  private lastEmittedScore = -1

  private readonly dinoSprite = new Image()
  private isDinoSpriteReady = false
  private cactusSprites: HTMLImageElement[] = []
  private isCactusSpritesReady = false

  private runAnimationElapsed = 0
  private runFrameCursor = 0

  private obstacles: Obstacle[] = []
  private nextObstacleIn = 0

  private groundImg: HTMLImageElement | null = null
  private groundOffset = 0

  private readonly birdSprite = new Image()
  private isBirdSpriteReady = false

  private birdAnimationElapsed = 0
  private birdFrameCursor = 0

  private clouds: Cloud[] = []
  private nextCloudIn = 0

  private readonly cloudSprite = new Image()
  private isCloudSpriteReady = false

  private readonly heartSprite = new Image()
  private isHeartReady = false

  private lives = START_LIVES
  private invincibleLeft = 0
  private blinkElapsed = 0
  private blinkVisible = true

  private readonly digitsSprite = new Image()
  private isDigitsReady = false

  private theme: DinoGameThemeTokens = DINO_GAME_LIGHT_THEME

  constructor(ctx: CanvasRenderingContext2D, options: DinoGameOptions = {}) {
    this.ctx = ctx
    this.width = options.width ?? GAME_WIDTH
    this.height = options.height ?? GAME_HEIGHT

    this.dino = createDino(this.getGroundY())
    const id = this.pickCactusVariantIndex()
    const v = this.cactusVariants[id]
    this.obstacles = [
      createCactusObstacle(this.width + 200, this.getGroundY(), id, v.w, v.h, this.scale),
    ]
    this.nextObstacleIn = 0.8

    this.groundImg = new Image()
    this.groundImg.src = groundLongSrc

    this.setupSprites()
    this.setTheme(options.theme ?? DINO_GAME_LIGHT_THEME)
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
  }

  public requestJump() {
    this.input.jumpRequested = true
  }

  public setTheme(theme: DinoGameThemeTokens) {
    const isSameTheme = this.theme.mode === theme.mode

    this.theme = theme

    if (!this.isRunning && !isSameTheme) {
      this.renderStartHint()
    }
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

  private readonly cactusVariants = [
    { w: 40, h: 60, weight: 1 },
    { w: 30, h: 50, weight: 3 },
    { w: 50, h: 60, weight: 1 },
    { w: 25, h: 40, weight: 2 },
    { w: 30, h: 45, weight: 3 },
  ]

  private get scale() {
    return SPRITE_SCALE
  }

  private setupSprites() {
    this.loadSprite(this.dinoSprite, dinoSpriteUrl, () => {
      this.isDinoSpriteReady = true
    })

    const cactusUrls = [
      cactus1SpriteUrl,
      cactus2SpriteUrl,
      cactus3SpriteUrl,
      cactus4SpriteUrl,
      cactus5SpriteUrl,
    ]

    let loaded = 0
    this.cactusSprites = cactusUrls.map(url => {
      const img = new Image()
      this.loadSprite(img, url, () => {
        loaded += 1
        if (loaded === cactusUrls.length) {
          this.isCactusSpritesReady = true
        }
      })
      return img
    })

    this.loadSprite(this.birdSprite, birdSpriteUrl, () => {
      this.isBirdSpriteReady = true
    })

    this.loadSprite(this.cloudSprite, cloudSpriteUrl, () => {
      this.isCloudSpriteReady = true
    })

    this.loadSprite(this.heartSprite, heartUrl, () => {
      this.isHeartReady = true
    })

    this.loadSprite(this.digitsSprite, digitsUrl, () => {
      this.isDigitsReady = true
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
    this.resetGameInfo()
    this.resetObstacles()
    this.resetBackground()
  }

  private resetGameInfo() {
    this.score = 0
    this.isGameOver = false
    this.runAnimationElapsed = 0
    this.runFrameCursor = 0
    this.lives = START_LIVES
    this.invincibleLeft = 0
    this.blinkElapsed = 0
    this.blinkVisible = true
  }
  private resetBackground() {
    this.clouds = []
    this.nextCloudIn = 0.2
  }

  private resetObstacles() {
    const groundY = this.getGroundY()
    const id = this.pickCactusVariantIndex()
    const v = this.cactusVariants[id]
    this.obstacles = [createCactusObstacle(this.width + 200, groundY, id, v.w, v.h, this.scale)]
    this.nextObstacleIn = 0.8
    this.birdAnimationElapsed = 0
    this.birdFrameCursor = 0
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
    this.updateObstacles(delta, groundY)
    this.updateBirdAnimation(delta)
    this.updateClouds(delta)

    if (this.groundImg?.width) {
      this.groundOffset += WORLD_SPEED * delta
    }

    this.handleCollision(delta)

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

  private updateClouds(delta: number) {
    for (const c of this.clouds) {
      c.position.x -= CLOUD_SPEED * delta
    }

    this.clouds = this.clouds.filter(c => c.position.x + c.width > 0)

    this.nextCloudIn -= delta
    if (this.nextCloudIn > 0) return

    const x = this.width + 20
    const y = CLOUD_Y_MIN + Math.random() * (CLOUD_Y_MAX - CLOUD_Y_MIN)

    const scale = 5 + Math.random() * 0.8

    this.clouds.push({
      position: { x, y },
      width: CLOUD_WIDTH,
      height: CLOUD_HEIGHT,
      scale,
    })

    this.nextCloudIn = CLOUD_SPAWN_MIN + Math.random() * (CLOUD_SPAWN_MAX - CLOUD_SPAWN_MIN)
  }

  private updateObstacles(delta: number, groundY: number) {
    for (const o of this.obstacles) {
      const speed = o.kind === 'bird' ? WORLD_SPEED * BIRD_SPEED_MULTIPLIER : WORLD_SPEED
      o.position.x -= speed * delta
    }

    this.nextObstacleIn -= delta
    if (this.nextObstacleIn > 0) return

    const MIN_GAP_PX = 280
    const last = this.obstacles[this.obstacles.length - 1]
    if (last && last.position.x > this.width - MIN_GAP_PX) {
      return
    }

    const spawnX = this.width + 150 + Math.random() * 200
    const canSpawnBird = this.score >= 30
    const roll = Math.random()
    const id = this.pickCactusVariantIndex()
    const v = this.cactusVariants[id]

    const next =
      canSpawnBird && roll < 0.35
        ? createBirdObstacle(spawnX, groundY, this.scale)
        : createCactusObstacle(spawnX, groundY, id, v.w, v.h, this.scale)

    this.obstacles.push(next)
    this.nextObstacleIn = 1.1 + Math.random() * 0.9
    this.score += 1
    this.emitScore()
  }

  private pickCactusVariantIndex() {
    const total = this.cactusVariants.reduce((s, v) => s + v.weight, 0)
    let r = Math.random() * total
    for (let i = 0; i < this.cactusVariants.length; i++) {
      r -= this.cactusVariants[i].weight
      if (r <= 0) return i
    }
    return 0
  }

  private updateBirdAnimation(delta: number) {
    this.birdAnimationElapsed += delta
    const frameDuration = 1 / BIRD_ANIMATION_FPS

    while (this.birdAnimationElapsed >= frameDuration) {
      this.birdAnimationElapsed -= frameDuration
      this.birdFrameCursor = (this.birdFrameCursor + 1) % BIRD_FRAME_COUNT
    }
  }

  private checkCollision() {
    const dino = this.getDinoHitbox()

    for (const o of this.obstacles) {
      const ob = this.getObstacleHitbox(o)
      const hit =
        dino.left < ob.right && dino.right > ob.left && dino.top < ob.bottom && dino.bottom > ob.top

      if (hit) return true
    }

    return false
  }

  private handleCollision(delta: number) {
    if (this.isGameOver) return

    if (this.invincibleLeft > 0) {
      this.invincibleLeft = Math.max(0, this.invincibleLeft - delta)

      this.blinkElapsed += delta
      const blinkStep = 1 / DINO_BLINK_FPS

      while (this.blinkElapsed >= blinkStep) {
        this.blinkElapsed -= blinkStep
        this.blinkVisible = !this.blinkVisible
      }

      if (this.invincibleLeft === 0) {
        this.blinkVisible = true
      }

      return
    }

    if (!this.checkCollision()) return

    this.lives -= 1

    if (this.lives <= 0) {
      this.isGameOver = true
      this.emitter.emit('gameover', Math.floor(this.score))
      return
    }

    this.invincibleLeft = INVINCIBLE_TIME
    this.blinkElapsed = 0
    this.blinkVisible = false
  }

  private getDinoHitbox(): Rect {
    return {
      left: this.dino.position.x + DINO_WIDTH * DINO_HITBOX_INSET_LEFT,
      right: this.dino.position.x + DINO_WIDTH * (1 - DINO_HITBOX_INSET_RIGHT),
      top: this.dino.position.y + DINO_HEIGHT * DINO_HITBOX_INSET_TOP,
      bottom: this.dino.position.y + DINO_HEIGHT * (1 - DINO_HITBOX_INSET_BOTTOM),
    }
  }

  private getObstacleHitbox(o: Obstacle): Rect {
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

  private emitScore() {
    const roundedScore = Math.floor(this.score)
    if (roundedScore === this.lastEmittedScore) return

    this.lastEmittedScore = roundedScore
    this.emitter.emit('score', roundedScore)
  }

  private render(showStartHint: boolean) {
    const groundY = this.getGroundY()

    this.renderBackground(groundY)
    this.renderClouds()
    this.renderGround(groundY)
    this.renderDino()
    this.renderObstacles()
    this.renderHud()
    this.renderOverlay(showStartHint)
  }

  private renderBackground(groundY: number) {
    const ctx = this.ctx

    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillStyle = this.theme.backgroundColor
    ctx.fillRect(0, 0, this.width, this.height)
  }

  private renderGround(groundY: number) {
    if (!this.ctx || !this.groundImg || !this.groundImg.width) return

    const ctx = this.ctx
    const img = this.groundImg

    const imgW = img.width
    const imgH = img.height

    const offset = Math.floor(((this.groundOffset % imgW) + imgW) % imgW)

    const y = Math.floor(groundY - imgH)

    let x = -offset

    while (x < this.width + imgW) {
      ctx.drawImage(img, Math.floor(x), y)
      x += imgW
    }
  }

  private renderObstacles() {
    const ctx = this.ctx
    ctx.save()
    ctx.imageSmoothingEnabled = false

    for (const o of this.obstacles) {
      if (o.kind === 'cactus') {
        if (!this.isCactusSpritesReady) continue

        const sprite = this.cactusSprites[o.variant] ?? this.cactusSprites[0]
        ctx.drawImage(
          sprite,
          0,
          0,
          sprite.width,
          sprite.height,
          o.position.x,
          o.position.y,
          o.width,
          o.height
        )
      } else {
        if (!this.isBirdSpriteReady) continue
        const frameIndex = this.birdFrameCursor
        const sourceX = 0
        const sourceY = frameIndex * BIRD_SPRITE_FRAME_HEIGHT

        ctx.drawImage(
          this.birdSprite,
          sourceX,
          sourceY,
          BIRD_SPRITE_WIDTH,
          BIRD_SPRITE_FRAME_HEIGHT,
          o.position.x,
          o.position.y,
          o.width,
          o.height
        )
      }
    }

    ctx.restore()
  }

  private renderHud() {
    const ctx = this.ctx

    this.renderScore()

    if (this.isHeartReady) {
      const size = 20 * this.scale
      const gap = 6

      for (let i = 0; i < this.lives; i++) {
        const x = this.width - 16 - (size + gap) * (i + 1)
        const y = 10

        ctx.drawImage(this.heartSprite, x, y, size, size)
      }
    }
  }

  private renderScore() {
    if (!this.isDigitsReady) return

    const ctx = this.ctx
    ctx.save()
    ctx.imageSmoothingEnabled = false

    const scoreStr = Math.floor(this.score).toString().padStart(5, '0')

    const scale = 0.7 * this.scale
    const digitSpacing = 3
    const digitW = DIGIT_WIDTH * scale
    const digitH = DIGIT_HEIGHT * scale

    let x = 16
    const y = 10

    for (const char of scoreStr) {
      const digit = Number(char)
      const sourceX = digit * DIGIT_WIDTH

      ctx.drawImage(this.digitsSprite, sourceX, 0, DIGIT_WIDTH, DIGIT_HEIGHT, x, y, digitW, digitH)

      x += digitW + digitSpacing
    }

    ctx.restore()
  }

  private renderOverlay(showStartHint: boolean) {
    const ctx = this.ctx

    if (this.isGameOver) {
      ctx.fillStyle = this.theme.uiTextColor
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

    ctx.fillStyle = this.theme.uiTextColor
    ctx.textAlign = 'center'
    ctx.font = `${14 * UI_TEXT_SCALE}px monospace`
    ctx.fillText('Кликни или нажми Пробел', this.width / 2, this.height / 2)
    ctx.textAlign = 'start'
  }

  private renderClouds() {
    if (!this.isCloudSpriteReady) return

    const ctx = this.ctx
    ctx.save()

    ctx.imageSmoothingEnabled = true

    for (const c of this.clouds) {
      const scale = c.scale ?? 1
      const w = c.width * scale
      const h = c.height * scale

      ctx.drawImage(
        this.cloudSprite,
        0,
        0,
        this.cloudSprite.width * this.scale,
        this.cloudSprite.height * this.scale,
        c.position.x,
        c.position.y,
        w,
        h
      )
    }

    ctx.restore()
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
    if (!this.isDinoSpriteReady || !this.blinkVisible) {
      return
    }

    const ctx = this.ctx
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
}
