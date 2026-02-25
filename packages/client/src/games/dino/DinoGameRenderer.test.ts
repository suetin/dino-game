import { DinoGameAssetsView } from './DinoGameAssets'
import { ReadonlyGameState } from './DinoGameEngine'
import { DinoGameRenderer } from './DinoGameRenderer'
import { DINO_GAME_LIGHT_THEME } from './theme'

function createMockCtx(): CanvasRenderingContext2D {
  const ctx = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    drawImage: jest.fn(),
    fillText: jest.fn(),
    set imageSmoothingEnabled(value: boolean) {
      void value
    },
    set fillStyle(value: string | CanvasGradient | CanvasPattern) {
      void value
    },
    set textAlign(value: CanvasTextAlign) {
      void value
    },
    set font(value: string) {
      void value
    },
  }

  return ctx as unknown as CanvasRenderingContext2D
}

function createState(): ReadonlyGameState {
  return {
    width: 800,
    height: 300,
    dino: {
      position: { x: 80, y: 100 },
      velocityY: 0,
      isOnGround: true,
    },
    score: 0,
    isGameOver: false,
    obstacles: [],
    nextObstacleIn: 0.8,
    clouds: [],
    nextCloudIn: 0.2,
    groundOffset: 0,
    runAnimationElapsed: 0,
    runFrameCursor: 0,
    birdAnimationElapsed: 0,
    birdFrameCursor: 0,
    lives: 3,
    invincibleLeft: 0,
    blinkElapsed: 0,
    blinkVisible: true,
  }
}

function createAssets(): DinoGameAssetsView {
  return {
    groundImg: null,
    dinoSprite: new Image(),
    isDinoSpriteReady: false,
    cactusSprites: [],
    isCactusSpritesReady: false,
    birdSprite: new Image(),
    isBirdSpriteReady: false,
    cloudSprite: new Image(),
    isCloudSpriteReady: false,
    heartSprite: new Image(),
    isHeartReady: false,
    digitsSprite: new Image(),
    isDigitsReady: false,
  }
}

describe('DinoGameRenderer', () => {
  it('не падает, если ассеты еще не загружены', () => {
    const renderer = new DinoGameRenderer(createMockCtx())

    expect(() =>
      renderer.render({
        state: createState(),
        theme: DINO_GAME_LIGHT_THEME,
        assets: createAssets(),
        showStartHint: true,
      })
    ).not.toThrow()
  })
})
