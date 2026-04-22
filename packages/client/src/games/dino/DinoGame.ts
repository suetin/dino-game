import { GAME_HEIGHT, GAME_WIDTH } from './constants'
import { DinoGameAssets, DinoGameAssetsStatus } from './DinoGameAssets'
import { DinoGameEngine, EngineTickResult, ReadonlyGameState } from './DinoGameEngine'
import { DinoGameRenderer } from './DinoGameRenderer'
import mitt, { Emitter } from 'mitt'
import { DINO_GAME_LIGHT_THEME, DinoGameThemeTokens } from './theme'

type DinoGameEvents = {
  score: number
  gameover: number
}

export type DinoGameDeps = {
  random: () => number
  now: () => number
  raf: (cb: FrameRequestCallback) => number
  cancelRaf: (id: number) => void
  createImage: () => HTMLImageElement
}

export type DinoGameOptions = {
  width?: number
  height?: number
  theme?: DinoGameThemeTokens
  autoloadAssets?: boolean
  deps?: Partial<DinoGameDeps>
}

function createRuntimeDeps(options: DinoGameOptions): DinoGameDeps {
  return {
    random: options.deps?.random ?? Math.random,
    now: options.deps?.now ?? (() => performance.now()),
    raf: options.deps?.raf ?? (cb => requestAnimationFrame(cb)),
    cancelRaf: options.deps?.cancelRaf ?? (id => cancelAnimationFrame(id)),
    createImage: options.deps?.createImage ?? (() => new Image()),
  }
}

export class DinoGame {
  private readonly emitter: Emitter<DinoGameEvents> = mitt<DinoGameEvents>()
  private readonly deps: DinoGameDeps
  private readonly engine: DinoGameEngine
  private readonly assets: DinoGameAssets
  private readonly renderer: DinoGameRenderer

  private lastTime = 0
  private rafId = 0
  private running = false
  private theme: DinoGameThemeTokens = DINO_GAME_LIGHT_THEME

  constructor(ctx: CanvasRenderingContext2D, options: DinoGameOptions = {}) {
    this.deps = createRuntimeDeps(options)
    this.engine = new DinoGameEngine({
      width: options.width ?? GAME_WIDTH,
      height: options.height ?? GAME_HEIGHT,
      deps: { random: this.deps.random },
    })
    this.assets = new DinoGameAssets(this.deps.createImage, {
      onAssetLoaded: () => {
        if (!this.running) {
          this.renderStartHint()
        }
      },
      onAssetError: url => {
        console.error('Не удалось загрузить спрайт:', url)
      },
    })
    this.renderer = new DinoGameRenderer(ctx)

    if (options.autoloadAssets ?? true) {
      void this.loadAssets().catch(() => undefined)
    }

    this.setTheme(options.theme ?? DINO_GAME_LIGHT_THEME)
  }

  public start() {
    if (this.running) return

    this.running = true
    this.lastTime = this.deps.now()
    this.loop(this.lastTime)
  }

  public stop() {
    this.running = false
    this.deps.cancelRaf(this.rafId)
  }

  public destroy() {
    this.stop()
  }

  public reset() {
    this.emitEngineEvents(this.engine.reset())
  }

  public resize(width: number, height: number) {
    this.engine.resize(width, height)
  }

  public requestJump() {
    this.engine.requestJump()
  }

  public setTheme(theme: DinoGameThemeTokens) {
    const isSameTheme = this.theme.mode === theme.mode
    this.theme = theme

    if (!this.running && !isSameTheme) {
      this.renderStartHint()
    }
  }

  public renderStartHint() {
    this.render(true)
  }

  public loadAssets(): Promise<void> {
    return this.assets.load()
  }

  public get state(): ReadonlyGameState {
    return this.engine.state
  }

  public get isRunning() {
    return this.running
  }

  public get assetsStatus(): DinoGameAssetsStatus {
    return this.assets.status
  }

  public get assetsReady() {
    return this.assets.isReady()
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

  private loop = (time: number) => {
    const delta = Math.min((time - this.lastTime) / 1000, 0.05)
    this.lastTime = time

    this.emitEngineEvents(this.engine.step(delta))
    this.render(false)

    if (this.running) {
      this.rafId = this.deps.raf(this.loop)
    }
  }

  private render(showStartHint: boolean) {
    this.renderer.render({
      state: this.state,
      theme: this.theme,
      assets: this.assets.getSnapshot(),
      showStartHint,
    })
  }

  private emitEngineEvents(result: EngineTickResult) {
    for (const event of result.events) {
      if (event.type === 'score') {
        this.emitter.emit('score', event.value)
        continue
      }

      this.emitter.emit('gameover', event.value)
    }
  }
}
