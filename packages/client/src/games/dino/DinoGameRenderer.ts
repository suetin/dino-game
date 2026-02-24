import {
  BIRD_SPRITE_FRAME_HEIGHT,
  BIRD_SPRITE_WIDTH,
  DIGIT_HEIGHT,
  DIGIT_WIDTH,
  DINO_DEAD_FRAME_INDEX,
  DINO_DEAD_SPRITE_SOURCE_WIDTH,
  DINO_HEIGHT,
  DINO_JUMP_FRAME_INDEX,
  DINO_RUN_FRAME_INDICES,
  DINO_SPRITE_FIRST_FRAME_Y,
  DINO_SPRITE_FRAME_HEIGHT,
  DINO_SPRITE_FRAME_STRIDE_Y,
  DINO_SPRITE_SOURCE_WIDTH,
  DINO_SPRITE_SOURCE_X,
  DINO_WIDTH,
  SPRITE_SCALE,
  UI_TEXT_SCALE,
} from './constants'
import { DinoGameAssetsView } from './DinoGameAssets'
import { ReadonlyGameState } from './DinoGameEngine'
import { getGroundY } from './logic'
import { DinoGameThemeTokens } from './theme'

export type DinoGameRenderParams = {
  state: ReadonlyGameState
  theme: DinoGameThemeTokens
  assets: DinoGameAssetsView
  showStartHint: boolean
}

export class DinoGameRenderer {
  private readonly ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  public render(params: DinoGameRenderParams) {
    this.renderWorldLayer(params)
    this.renderActorsLayer(params)
    this.renderUiLayer(params)
  }

  private get scale() {
    return SPRITE_SCALE
  }

  private renderWorldLayer(params: DinoGameRenderParams) {
    this.renderBackground(params)
    this.renderClouds(params)
    this.renderGround(params)
  }

  private renderActorsLayer(params: DinoGameRenderParams) {
    this.renderDino(params)
    this.renderObstacles(params)
  }

  private renderUiLayer(params: DinoGameRenderParams) {
    this.renderHud(params)
    this.renderOverlay(params)
  }

  private renderBackground({ state, theme }: DinoGameRenderParams) {
    const ctx = this.ctx
    ctx.clearRect(0, 0, state.width, state.height)
    ctx.fillStyle = theme.backgroundColor
    ctx.fillRect(0, 0, state.width, state.height)
  }

  private renderGround({ state, assets }: DinoGameRenderParams) {
    const img = assets.groundImg
    if (!img || !img.width) return

    const ctx = this.ctx
    const imgW = img.width
    const imgH = img.height
    const offset = Math.floor(((state.groundOffset % imgW) + imgW) % imgW)
    const groundY = getGroundY(state.height)
    const y = Math.floor(groundY - imgH)
    let x = -offset

    while (x < state.width + imgW) {
      ctx.drawImage(img, Math.floor(x), y)
      x += imgW
    }
  }

  private renderClouds({ state, assets }: DinoGameRenderParams) {
    if (!assets.isCloudSpriteReady) return

    const ctx = this.ctx
    ctx.save()
    ctx.imageSmoothingEnabled = true

    for (const cloud of state.clouds) {
      const scale = cloud.scale ?? 1
      const width = cloud.width * scale
      const height = cloud.height * scale

      ctx.drawImage(
        assets.cloudSprite,
        0,
        0,
        assets.cloudSprite.width * this.scale,
        assets.cloudSprite.height * this.scale,
        cloud.position.x,
        cloud.position.y,
        width,
        height
      )
    }

    ctx.restore()
  }

  private renderObstacles({ state, assets }: DinoGameRenderParams) {
    const ctx = this.ctx
    ctx.save()
    ctx.imageSmoothingEnabled = false

    for (const obstacle of state.obstacles) {
      if (obstacle.kind === 'cactus') {
        if (!assets.isCactusSpritesReady) continue

        const sprite = assets.cactusSprites[obstacle.variant] ?? assets.cactusSprites[0]
        if (!sprite) continue

        ctx.drawImage(
          sprite,
          0,
          0,
          sprite.width,
          sprite.height,
          obstacle.position.x,
          obstacle.position.y,
          obstacle.width,
          obstacle.height
        )
        continue
      }

      if (!assets.isBirdSpriteReady) continue

      const sourceY = state.birdFrameCursor * BIRD_SPRITE_FRAME_HEIGHT
      ctx.drawImage(
        assets.birdSprite,
        0,
        sourceY,
        BIRD_SPRITE_WIDTH,
        BIRD_SPRITE_FRAME_HEIGHT,
        obstacle.position.x,
        obstacle.position.y,
        obstacle.width,
        obstacle.height
      )
    }

    ctx.restore()
  }

  private renderHud(params: DinoGameRenderParams) {
    this.renderScore(params)

    if (!params.assets.isHeartReady) return

    const size = 20 * this.scale
    const gap = 6

    for (let i = 0; i < params.state.lives; i++) {
      const x = params.state.width - 16 - (size + gap) * (i + 1)
      const y = 10
      this.ctx.drawImage(params.assets.heartSprite, x, y, size, size)
    }
  }

  private renderScore({ state, assets }: DinoGameRenderParams) {
    if (!assets.isDigitsReady) return

    const ctx = this.ctx
    ctx.save()
    ctx.imageSmoothingEnabled = false

    const scoreText = Math.floor(state.score).toString().padStart(5, '0')
    const scale = 0.7 * this.scale
    const digitSpacing = 3
    const digitWidth = DIGIT_WIDTH * scale
    const digitHeight = DIGIT_HEIGHT * scale
    let x = 16
    const y = 10

    for (const char of scoreText) {
      const digit = Number(char)
      const sourceX = digit * DIGIT_WIDTH
      ctx.drawImage(
        assets.digitsSprite,
        sourceX,
        0,
        DIGIT_WIDTH,
        DIGIT_HEIGHT,
        x,
        y,
        digitWidth,
        digitHeight
      )
      x += digitWidth + digitSpacing
    }

    ctx.restore()
  }

  private renderOverlay({ state, theme, showStartHint }: DinoGameRenderParams) {
    const ctx = this.ctx

    if (state.isGameOver) {
      ctx.fillStyle = theme.uiTextColor
      ctx.textAlign = 'center'
      ctx.font = `${24 * UI_TEXT_SCALE}px monospace`
      ctx.fillText('Конец игры', state.width / 2, state.height / 2)
      ctx.font = `${14 * UI_TEXT_SCALE}px monospace`
      ctx.fillText('Нажмите R для рестарта', state.width / 2, state.height / 2 + 24 * UI_TEXT_SCALE)
      ctx.textAlign = 'start'
      return
    }

    if (!showStartHint) return

    ctx.fillStyle = theme.uiTextColor
    ctx.textAlign = 'center'
    ctx.font = `${14 * UI_TEXT_SCALE}px monospace`
    ctx.fillText('Кликни или нажми Пробел', state.width / 2, state.height / 2)
    ctx.textAlign = 'start'
  }

  private renderDino({ state, assets }: DinoGameRenderParams) {
    if (!assets.isDinoSpriteReady || !state.blinkVisible) return

    const frameIndex = this.getCurrentDinoFrameIndex(state)
    const sourceX = DINO_SPRITE_SOURCE_X
    const sourceY = DINO_SPRITE_FIRST_FRAME_Y + frameIndex * DINO_SPRITE_FRAME_STRIDE_Y
    const sourceHeight = DINO_SPRITE_FRAME_HEIGHT
    const maxSourceWidth =
      frameIndex === DINO_DEAD_FRAME_INDEX
        ? DINO_DEAD_SPRITE_SOURCE_WIDTH
        : DINO_SPRITE_SOURCE_WIDTH
    const sourceWidth = Math.min(maxSourceWidth, assets.dinoSprite.width - sourceX)

    if (sourceWidth <= 0 || sourceY + sourceHeight > assets.dinoSprite.height) return

    const ctx = this.ctx
    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(
      assets.dinoSprite,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      state.dino.position.x,
      state.dino.position.y,
      DINO_WIDTH,
      DINO_HEIGHT
    )
    ctx.restore()
  }

  private getCurrentDinoFrameIndex(state: ReadonlyGameState) {
    if (state.isGameOver) return DINO_DEAD_FRAME_INDEX
    if (!state.dino.isOnGround) return DINO_JUMP_FRAME_INDEX
    return DINO_RUN_FRAME_INDICES[state.runFrameCursor]
  }
}
