import { DinoGame } from './DinoGame'

jest.mock('mitt', () => {
  type Handler = (value: unknown) => void
  type EventsMap = Map<string, Set<Handler>>

  return {
    __esModule: true,
    default: () => {
      const events: EventsMap = new Map()

      return {
        on: (type: string, handler: Handler) => {
          if (!events.has(type)) {
            events.set(type, new Set())
          }
          events.get(type)?.add(handler)
        },
        off: (type: string, handler: Handler) => {
          events.get(type)?.delete(handler)
        },
        emit: (type: string, value: unknown) => {
          events.get(type)?.forEach(handler => handler(value))
        },
      }
    },
  }
})

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

describe('DinoGame facade', () => {
  it('отправляет событие score после reset', () => {
    const game = new DinoGame(createMockCtx(), { autoloadAssets: false, deps: { random: () => 0 } })
    const onScore = jest.fn()

    game.on('score', onScore)
    game.reset()

    expect(onScore).toHaveBeenCalledWith(0)
  })

  it('дает доступ к методам состояния и управления', () => {
    let nowValue = 1000
    const raf = jest.fn((cb: FrameRequestCallback) => {
      void cb
      return 1
    })
    const cancelRaf = jest.fn()
    const game = new DinoGame(createMockCtx(), {
      autoloadAssets: false,
      deps: {
        now: () => nowValue,
        raf,
        cancelRaf,
        random: () => 0,
      },
    })

    expect(game.isRunning).toBe(false)
    expect(game.assetsStatus).toBe('idle')
    expect(game.assetsReady).toBe(false)
    expect(game.state.score).toBe(0)

    game.start()
    expect(game.isRunning).toBe(true)
    expect(raf).toHaveBeenCalled()

    game.destroy()
    expect(game.isRunning).toBe(false)
    expect(cancelRaf).toHaveBeenCalledWith(1)

    nowValue += 100
  })
})
