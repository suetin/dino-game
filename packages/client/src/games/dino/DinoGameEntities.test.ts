import { BIRD_HEIGHT, BIRD_WIDTH, DINO_HEIGHT } from './constants'
import { createBirdObstacle, createCactusObstacle, createDino } from './entities'

describe('Entities', () => {
  it('создает динозавра на земле', () => {
    const groundY = 240
    const dino = createDino(groundY)

    expect(dino.position.x).toBe(80)
    expect(dino.position.y).toBe(groundY - DINO_HEIGHT)
    expect(dino.velocityY).toBe(0)
    expect(dino.isOnGround).toBe(true)
  })

  it('создает кактус с учетом масштаба', () => {
    const obstacle = createCactusObstacle(500, 240, 2, 30, 40, 3)

    expect(obstacle.kind).toBe('cactus')
    expect(obstacle.variant).toBe(2)
    expect(obstacle.width).toBe(90)
    expect(obstacle.height).toBe(120)
    expect(obstacle.position.x).toBe(500)
    expect(obstacle.position.y).toBe(120)
  })

  it('создает птицу на одном из уровней высоты', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.99)

    const obstacle = createBirdObstacle(400, 300, 2)

    expect(obstacle.kind).toBe('bird')
    expect(obstacle.gap).toBe(250)
    expect(obstacle.width).toBe(BIRD_WIDTH * 2)
    expect(obstacle.height).toBe(BIRD_HEIGHT * 2)
    expect(obstacle.position.y).toBe(300 - BIRD_HEIGHT - 250)

    randomSpy.mockRestore()
  })

  it('берет последний уровень птицы при random = 1', () => {
    const obstacle = createBirdObstacle(400, 300, 2, () => 1)

    expect(obstacle.gap).toBe(250)
    expect(Number.isFinite(obstacle.position.y)).toBe(true)
  })
})
