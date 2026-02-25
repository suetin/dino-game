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

export type DinoGameImageFactory = () => HTMLImageElement

export type DinoGameAssetsCallbacks = {
  onAssetLoaded?: () => void
  onAssetError?: (url: string) => void
}

export type DinoGameAssetsStatus = 'idle' | 'loading' | 'ready' | 'error'

export type DinoGameAssetsView = {
  readonly groundImg: HTMLImageElement | null
  readonly dinoSprite: HTMLImageElement
  readonly isDinoSpriteReady: boolean
  readonly cactusSprites: readonly HTMLImageElement[]
  readonly isCactusSpritesReady: boolean
  readonly birdSprite: HTMLImageElement
  readonly isBirdSpriteReady: boolean
  readonly cloudSprite: HTMLImageElement
  readonly isCloudSpriteReady: boolean
  readonly heartSprite: HTMLImageElement
  readonly isHeartReady: boolean
  readonly digitsSprite: HTMLImageElement
  readonly isDigitsReady: boolean
}

export class DinoGameAssets {
  private readonly createImage: DinoGameImageFactory
  private readonly callbacks: DinoGameAssetsCallbacks

  private _groundImg: HTMLImageElement | null = null
  private _isGroundReady = false
  private readonly _dinoSprite: HTMLImageElement
  private _isDinoSpriteReady = false
  private _cactusSprites: HTMLImageElement[] = []
  private _isCactusSpritesReady = false
  private readonly _birdSprite: HTMLImageElement
  private _isBirdSpriteReady = false
  private readonly _cloudSprite: HTMLImageElement
  private _isCloudSpriteReady = false
  private readonly _heartSprite: HTMLImageElement
  private _isHeartReady = false
  private readonly _digitsSprite: HTMLImageElement
  private _isDigitsReady = false
  private loadStarted = false
  private hasErrors = false
  private loadPromise: Promise<void> | null = null
  private resolveLoadPromise: (() => void) | null = null
  private rejectLoadPromise: ((error: Error) => void) | null = null

  constructor(createImage: DinoGameImageFactory, callbacks: DinoGameAssetsCallbacks = {}) {
    this.createImage = createImage
    this.callbacks = callbacks

    this._dinoSprite = this.createImage()
    this._birdSprite = this.createImage()
    this._cloudSprite = this.createImage()
    this._heartSprite = this.createImage()
    this._digitsSprite = this.createImage()
  }

  public load(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      this.resolveLoadPromise = resolve
      this.rejectLoadPromise = reject
    })

    if (this.isReady()) {
      this.resolveLoadPromise?.()
      return this.loadPromise
    }

    if (this.hasErrors) {
      this.rejectLoadPromise?.(new Error('Assets loading failed'))
      return this.loadPromise
    }

    if (this.loadStarted) {
      return this.loadPromise
    }

    this.loadStarted = true
    this._groundImg = this.createImage()
    this._groundImg.onload = () => {
      this._isGroundReady = true
      this.callbacks.onAssetLoaded?.()
      this.tryResolveLoadPromise()
    }
    this._groundImg.onerror = () => {
      this.hasErrors = true
      this.callbacks.onAssetError?.(groundLongSrc)
      this.tryRejectLoadPromise(groundLongSrc)
    }
    this._groundImg.src = groundLongSrc

    this.setupSprites()
    return this.loadPromise
  }

  public get status(): DinoGameAssetsStatus {
    if (!this.loadStarted) return 'idle'
    if (this.isReady()) return 'ready'
    if (this.hasErrors) return 'error'
    return 'loading'
  }

  public isReady() {
    return (
      this._isGroundReady &&
      this._isDinoSpriteReady &&
      this._isCactusSpritesReady &&
      this._isBirdSpriteReady &&
      this._isCloudSpriteReady &&
      this._isHeartReady &&
      this._isDigitsReady
    )
  }

  public hasError() {
    return this.hasErrors
  }

  public getSnapshot(): DinoGameAssetsView {
    return {
      groundImg: this._groundImg,
      dinoSprite: this._dinoSprite,
      isDinoSpriteReady: this._isDinoSpriteReady,
      cactusSprites: this._cactusSprites,
      isCactusSpritesReady: this._isCactusSpritesReady,
      birdSprite: this._birdSprite,
      isBirdSpriteReady: this._isBirdSpriteReady,
      cloudSprite: this._cloudSprite,
      isCloudSpriteReady: this._isCloudSpriteReady,
      heartSprite: this._heartSprite,
      isHeartReady: this._isHeartReady,
      digitsSprite: this._digitsSprite,
      isDigitsReady: this._isDigitsReady,
    }
  }

  private setupSprites() {
    this.loadSprite(this._dinoSprite, dinoSpriteUrl, () => {
      this._isDinoSpriteReady = true
    })
    this.setupCactusSprites()

    this.loadSprite(this._birdSprite, birdSpriteUrl, () => {
      this._isBirdSpriteReady = true
    })

    this.loadSprite(this._cloudSprite, cloudSpriteUrl, () => {
      this._isCloudSpriteReady = true
    })

    this.loadSprite(this._heartSprite, heartUrl, () => {
      this._isHeartReady = true
    })

    this.loadSprite(this._digitsSprite, digitsUrl, () => {
      this._isDigitsReady = true
    })
  }

  private setupCactusSprites() {
    const cactusUrls = [
      cactus1SpriteUrl,
      cactus2SpriteUrl,
      cactus3SpriteUrl,
      cactus4SpriteUrl,
      cactus5SpriteUrl,
    ]

    let loaded = 0
    this._cactusSprites = cactusUrls.map(url => {
      const image = this.createImage()
      this.loadSprite(image, url, () => {
        loaded += 1
        if (loaded === cactusUrls.length) {
          this._isCactusSpritesReady = true
        }
      })
      return image
    })
  }

  private loadSprite(image: HTMLImageElement, url: string, onLoad: () => void) {
    image.onload = () => {
      onLoad()
      this.callbacks.onAssetLoaded?.()
      this.tryResolveLoadPromise()
    }
    image.onerror = () => {
      this.hasErrors = true
      this.callbacks.onAssetError?.(url)
      this.tryRejectLoadPromise(url)
    }
    image.src = url
  }

  private tryResolveLoadPromise() {
    if (!this.loadPromise || !this.resolveLoadPromise) return
    if (!this.isReady()) return

    this.resolveLoadPromise()
    this.resolveLoadPromise = null
    this.rejectLoadPromise = null
  }

  private tryRejectLoadPromise(url: string) {
    if (!this.loadPromise || !this.rejectLoadPromise) return

    this.rejectLoadPromise(new Error(`Failed to load asset: ${url}`))
    this.resolveLoadPromise = null
    this.rejectLoadPromise = null
  }
}
