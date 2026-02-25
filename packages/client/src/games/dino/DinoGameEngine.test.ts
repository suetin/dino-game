import { DINO_HEIGHT } from './constants'
import { createCactusObstacle } from './entities'
import { DinoGameEngine, GameState } from './DinoGameEngine'
import { getGroundY } from './logic'

type EngineWithMutableStateForTest = {
  _state: GameState
}

type MutableFrozenStateForTest = {
  score: number
  dino: {
    position: {
      x: number
      y: number
    }
  }
  obstacles: unknown[]
}

describe('DinoGameEngine', () => {
  it('создает состояние игры с начальными значениями', () => {
    const engine = new DinoGameEngine({ width: 900, height: 320, deps: { random: () => 0 } })

    expect(engine.state.width).toBe(900)
    expect(engine.state.height).toBe(320)
    expect(engine.state.score).toBe(0)
    expect(engine.state.lives).toBe(3)
    expect(engine.state.obstacles.length).toBe(1)
  })

  it('делает шаг игры и возвращает события счета', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })

    const events = engine.step(0.2)

    expect(events.events.some(event => event.type === 'score')).toBe(true)
    expect(engine.state.score).toBeGreaterThan(0)
  })

  it('игнорирует неправильный delta', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })

    expect(engine.step(Number.NaN)).toEqual({ events: [] })
    expect(engine.step(-1)).toEqual({ events: [] })
    expect(engine.state.score).toBe(0)
  })

  it('ограничивает слишком большой delta', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })

    engine.step(1)

    expect(engine.state.score).toBeCloseTo(0.5, 5)
  })

  it('сбрасывает состояние и отправляет обновление счета', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })
    engine.step(0.2)

    const resetEvents = engine.reset()

    expect(engine.state.score).toBe(0)
    expect(resetEvents.events).toContainEqual({ type: 'score', value: 0 })
    expect(engine.state.isGameOver).toBe(false)
  })

  it('отправляет score=0 при каждом reset подряд', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })

    const first = engine.reset()
    const second = engine.reset()

    expect(first.events).toContainEqual({ type: 'score', value: 0 })
    expect(second.events).toContainEqual({ type: 'score', value: 0 })
  })

  it('пересчитывает состояние при resize', () => {
    const engine = new DinoGameEngine({ width: 800, height: 300, deps: { random: () => 0 } })
    const oldGround = engine.getGroundY()
    const oldY = engine.state.dino.position.y

    engine.resize(800, 420)

    const newGround = engine.getGroundY()
    expect(newGround).not.toBe(oldGround)
    expect(engine.state.dino.position.y - oldY).toBe(newGround - oldGround)
  })

  it('вызывает gameover при потере последней жизни', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })
    const anyEngine = engine as unknown as EngineWithMutableStateForTest
    const groundY = getGroundY(engine.state.height)

    anyEngine._state.lives = 1
    anyEngine._state.invincibleLeft = 0
    anyEngine._state.isGameOver = false
    anyEngine._state.dino.position.y = groundY - DINO_HEIGHT
    anyEngine._state.dino.isOnGround = true
    anyEngine._state.obstacles = [
      createCactusObstacle(anyEngine._state.dino.position.x + 10, groundY, 0, 30, 40, 3),
    ]
    anyEngine._state.nextObstacleIn = 999

    const events = engine.step(0)

    expect(engine.state.isGameOver).toBe(true)
    expect(events.events).toContainEqual({ type: 'gameover', value: expect.any(Number) })
  })

  it('не меняет состояние после game over', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })
    const anyEngine = engine as unknown as EngineWithMutableStateForTest

    anyEngine._state.isGameOver = true
    const snapshot = JSON.parse(JSON.stringify(engine.state))

    const events = engine.step(0.5)

    expect(events.events).toEqual([])
    expect(engine.state).toEqual(snapshot)
  })

  it('не получает урон повторно во время неуязвимости', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })
    const anyEngine = engine as unknown as EngineWithMutableStateForTest
    const groundY = getGroundY(engine.state.height)

    anyEngine._state.lives = 2
    anyEngine._state.invincibleLeft = 0.5
    anyEngine._state.dino.position.y = groundY - DINO_HEIGHT
    anyEngine._state.dino.isOnGround = true
    anyEngine._state.obstacles = [
      createCactusObstacle(anyEngine._state.dino.position.x + 10, groundY, 0, 30, 40, 3),
    ]
    anyEngine._state.nextObstacleIn = 999

    engine.step(0.1)

    expect(engine.state.lives).toBe(2)
    expect(engine.state.invincibleLeft).toBeLessThan(0.5)
  })

  it('обрабатывает requestJump только один раз', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })

    engine.requestJump()
    engine.step(0.001)
    const velocityAfterJump = engine.state.dino.velocityY
    engine.step(0)

    expect(velocityAfterJump).toBeLessThan(0)
    expect(engine.state.dino.velocityY).toBe(velocityAfterJump)
  })

  it('возвращает копию состояния, а не живую ссылку', () => {
    const engine = new DinoGameEngine({ deps: { random: () => 0 } })
    const snapshot = engine.state as unknown as MutableFrozenStateForTest

    expect(() => {
      snapshot.score = 999
    }).toThrow()
    expect(() => {
      snapshot.dino.position.x = -100
    }).toThrow()
    expect(() => {
      snapshot.obstacles.length = 0
    }).toThrow()

    expect(engine.state.score).toBe(0)
    expect(engine.state.dino.position.x).toBe(80)
    expect(engine.state.obstacles.length).toBeGreaterThan(0)
  })
})
