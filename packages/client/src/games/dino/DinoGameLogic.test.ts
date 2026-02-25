import { DINO_BLINK_FPS, DINO_HEIGHT, INVINCIBLE_TIME, SPRITE_SCALE } from './constants'
import { createCactusObstacle, createDino } from './entities'
import { createInputState } from './input'
import {
  checkCollision,
  consumeJumpInput,
  getDinoHitbox,
  getGroundY,
  getObstacleHitbox,
  intersects,
  pickCactusVariantIndex,
  resizeWorldLayout,
  stepBirdAnimation,
  stepClouds,
  stepCollisionState,
  stepObstacles,
  stepRunAnimation,
  updateDinoPhysics,
} from './logic'

describe('Логика игры с динозавром', () => {
  it('обрабатывает прыжок только с земли', () => {
    const dino = createDino(240)
    const input = createInputState()
    input.jumpRequested = true

    consumeJumpInput(dino, input)

    expect(dino.isOnGround).toBe(false)
    expect(dino.velocityY).toBeLessThan(0)
    expect(input.jumpRequested).toBe(false)
  })

  it('применяет гравитацию и возвращает на землю', () => {
    const groundY = 240
    const dino = createDino(groundY)
    dino.isOnGround = false
    dino.velocityY = 0
    dino.position.y -= 50

    for (let i = 0; i < 30; i++) {
      updateDinoPhysics(dino, 1 / 60, groundY)
    }

    expect(dino.position.y).toBe(groundY - DINO_HEIGHT)
    expect(dino.velocityY).toBe(0)
    expect(dino.isOnGround).toBe(true)
  })

  it('находит столкновение при пересечении хитбоксов', () => {
    const groundY = 240
    const dino = createDino(groundY)
    const dinoBox = getDinoHitbox(dino)
    const cactus = createCactusObstacle(dino.position.x + 10, groundY, 0, 30, 40, SPRITE_SCALE)

    expect(checkCollision(dinoBox, [cactus])).toBe(true)
  })

  it('не считает столкновением прямоугольники без пересечения', () => {
    expect(
      intersects(
        { left: 0, right: 10, top: 0, bottom: 10 },
        { left: 11, right: 20, top: 0, bottom: 10 }
      )
    ).toBe(false)
  })

  it('двигает облака и создает новое облако по таймеру', () => {
    const result = stepClouds([], 0, 800, 0.1, () => 0.5)

    expect(result.clouds).toHaveLength(1)
    expect(result.clouds[0].position.x).toBe(820)
    expect(result.clouds[0].position.y).toBeGreaterThan(0)
    expect(result.nextCloudIn).toBeGreaterThan(1)
  })

  it('двигает облака без создания, пока таймер не истек', () => {
    const result = stepClouds(
      [{ position: { x: 100, y: 50 }, width: 20, height: 10 }],
      1,
      800,
      0.25,
      () => 0
    )

    expect(result.clouds).toHaveLength(1)
    expect(result.nextCloudIn).toBeCloseTo(0.75, 5)
  })

  it('удаляет облака, ушедшие за левую границу', () => {
    const result = stepClouds(
      [{ position: { x: -25, y: 10 }, width: 20, height: 10 }],
      1,
      800,
      0,
      () => 0
    )

    expect(result.clouds).toHaveLength(0)
  })

  it('двигает препятствия и создает кактус по таймеру', () => {
    const result = stepObstacles({
      obstacles: [],
      nextObstacleIn: 0,
      width: 800,
      groundY: 240,
      delta: 0.016,
      score: 0,
      scale: SPRITE_SCALE,
      cactusVariants: [{ w: 30, h: 40, weight: 1 }],
      random: () => 0,
      pickVariantIndex: () => 0,
    })

    expect(result.obstacles).toHaveLength(1)
    expect(result.obstacles[0].kind).toBe('cactus')
    expect(result.scoreBonus).toBe(1)
    expect(result.nextObstacleIn).toBeCloseTo(1.1, 5)
  })

  it('создает птицу после порога счета', () => {
    const result = stepObstacles({
      obstacles: [],
      nextObstacleIn: 0,
      width: 800,
      groundY: 300,
      delta: 0,
      score: 35,
      scale: SPRITE_SCALE,
      cactusVariants: [{ w: 30, h: 40, weight: 1 }],
      random: () => 0,
      pickVariantIndex: () => 0,
    })

    expect(result.obstacles[0].kind).toBe('bird')
  })

  it('не создает птицу при счете ниже порога', () => {
    const result = stepObstacles({
      obstacles: [],
      nextObstacleIn: 0,
      width: 800,
      groundY: 300,
      delta: 0,
      score: 29.9,
      scale: SPRITE_SCALE,
      cactusVariants: [{ w: 30, h: 40, weight: 1 }],
      random: () => 0,
      pickVariantIndex: () => 0,
    })

    expect(result.obstacles[0].kind).toBe('cactus')
  })

  it('создает кактус при высоком счете, если roll не подходит для птицы', () => {
    const randomValues = [0, 0.9, 0]
    let idx = 0
    const result = stepObstacles({
      obstacles: [],
      nextObstacleIn: 0,
      width: 800,
      groundY: 300,
      delta: 0,
      score: 100,
      scale: SPRITE_SCALE,
      cactusVariants: [{ w: 30, h: 40, weight: 1 }],
      random: () => randomValues[idx++] ?? 0,
      pickVariantIndex: () => 0,
    })

    expect(result.obstacles[0].kind).toBe('cactus')
  })

  it('не создает препятствие слишком близко', () => {
    const nearObstacle = createCactusObstacle(600, 240, 0, 30, 40, SPRITE_SCALE)
    const result = stepObstacles({
      obstacles: [nearObstacle],
      nextObstacleIn: 0,
      width: 800,
      groundY: 240,
      delta: 0,
      score: 0,
      scale: SPRITE_SCALE,
      cactusVariants: [{ w: 30, h: 40, weight: 1 }],
      random: () => 0,
      pickVariantIndex: () => 0,
    })

    expect(result.obstacles).toHaveLength(1)
    expect(result.scoreBonus).toBe(0)
    expect(result.nextObstacleIn).toBe(0)
  })

  it('удаляет ушедшие препятствия и уменьшает таймер', () => {
    const leftGone = createCactusObstacle(-200, 240, 0, 30, 40, SPRITE_SCALE)
    const visible = createCactusObstacle(100, 240, 0, 30, 40, SPRITE_SCALE)
    const result = stepObstacles({
      obstacles: [leftGone, visible],
      nextObstacleIn: 1,
      width: 800,
      groundY: 240,
      delta: 0.1,
      score: 0,
      scale: SPRITE_SCALE,
      cactusVariants: [{ w: 30, h: 40, weight: 1 }],
      random: () => 0,
      pickVariantIndex: () => 0,
    })

    expect(result.obstacles).toHaveLength(1)
    expect(result.scoreBonus).toBe(0)
    expect(result.nextObstacleIn).toBeCloseTo(0.9, 5)
  })

  it('уменьшает жизни при столкновении и включает неуязвимость', () => {
    const hit = stepCollisionState(
      {
        isGameOver: false,
        invincibleLeft: 0,
        blinkElapsed: 0,
        blinkVisible: true,
        lives: 3,
      },
      0.016,
      true
    )

    expect(hit.lives).toBe(2)
    expect(hit.invincibleLeft).toBe(INVINCIBLE_TIME)
    expect(hit.blinkVisible).toBe(false)
    expect(hit.gameOverTriggered).toBe(false)

    const afterInvincibility = stepCollisionState(hit, INVINCIBLE_TIME + 1 / DINO_BLINK_FPS, true)
    expect(afterInvincibility.invincibleLeft).toBe(0)
    expect(afterInvincibility.blinkVisible).toBe(true)
    expect(afterInvincibility.lives).toBe(2)
  })

  it('переводит состояние в game over, когда жизни заканчиваются', () => {
    const result = stepCollisionState(
      {
        isGameOver: false,
        invincibleLeft: 0,
        blinkElapsed: 0,
        blinkVisible: true,
        lives: 1,
      },
      0.016,
      true
    )

    expect(result.lives).toBe(0)
    expect(result.isGameOver).toBe(true)
    expect(result.gameOverTriggered).toBe(true)
  })

  it('переключает видимость во время мигания при неуязвимости', () => {
    const result = stepCollisionState(
      {
        isGameOver: false,
        invincibleLeft: 0.5,
        blinkElapsed: 0,
        blinkVisible: true,
        lives: 2,
      },
      1 / DINO_BLINK_FPS,
      true
    )

    expect(result.blinkVisible).toBe(false)
    expect(result.lives).toBe(2)
  })

  it('не меняет состояние, если игра уже окончена', () => {
    const state = {
      isGameOver: true,
      invincibleLeft: 0,
      blinkElapsed: 0.2,
      blinkVisible: false,
      lives: 0,
    }

    expect(stepCollisionState(state, 1, true)).toEqual({ ...state, gameOverTriggered: false })
  })

  it('не уменьшает жизни без столкновения', () => {
    const result = stepCollisionState(
      {
        isGameOver: false,
        invincibleLeft: 0,
        blinkElapsed: 0,
        blinkVisible: true,
        lives: 3,
      },
      0.016,
      false
    )

    expect(result.lives).toBe(3)
    expect(result.gameOverTriggered).toBe(false)
  })

  it('обновляет анимации только когда нужно', () => {
    const bird = stepBirdAnimation(0, 0, 0.2)
    expect(bird.frameCursor).not.toBe(0)

    const runAir = stepRunAnimation(false, 0, 0, 1)
    expect(runAir.frameCursor).toBe(0)

    const runGround = stepRunAnimation(true, 0, 0, 1)
    expect(runGround.frameCursor).not.toBe(0)
  })

  it('сохраняет остаток времени в анимации птицы', () => {
    const result = stepBirdAnimation(0, 0, 0.3)

    expect(result.elapsed).toBeGreaterThanOrEqual(0)
    expect(result.elapsed).toBeLessThan(1)
  })

  it('сохраняет остаток времени в анимации бега', () => {
    const result = stepRunAnimation(true, 0, 0, 0.3)

    expect(result.elapsed).toBeGreaterThanOrEqual(0)
    expect(result.elapsed).toBeLessThan(1)
  })

  it('выбирает вариант кактуса по весу', () => {
    const idx = pickCactusVariantIndex(
      [
        { w: 1, h: 1, weight: 1 },
        { w: 1, h: 1, weight: 5 },
      ],
      () => 0.99
    )

    expect(idx).toBe(1)
  })

  it('выбирает первый вариант при минимальном random', () => {
    const idx = pickCactusVariantIndex(
      [
        { w: 1, h: 1, weight: 1 },
        { w: 1, h: 1, weight: 5 },
      ],
      () => 0
    )

    expect(idx).toBe(0)
  })

  it('считает линию земли с нижней границей', () => {
    expect(getGroundY(20)).toBeGreaterThan(20)
  })

  it('пересчитывает позиции мира при смене высоты', () => {
    const oldHeight = 300
    const newHeight = 400
    const oldGroundY = getGroundY(oldHeight)
    const dino = createDino(oldGroundY)
    dino.isOnGround = false
    dino.position.y -= 30

    const cactus = createCactusObstacle(500, oldGroundY, 0, 30, 40, SPRITE_SCALE)
    const resized = resizeWorldLayout({
      dino,
      obstacles: [cactus],
      oldHeight,
      newHeight,
    })

    const newGroundY = getGroundY(newHeight)
    expect(resized.dino.position.y).toBe(newGroundY - DINO_HEIGHT - 30)
    expect(resized.obstacles[0].position.y).toBe(newGroundY - resized.obstacles[0].height)
  })

  it('оставляет динозавра на земле после resize', () => {
    const oldHeight = 300
    const newHeight = 360
    const dino = createDino(getGroundY(oldHeight))
    dino.velocityY = 50
    dino.isOnGround = false

    const resized = resizeWorldLayout({
      dino,
      obstacles: [],
      oldHeight,
      newHeight,
    })

    expect(resized.dino.position.y).toBe(getGroundY(newHeight) - DINO_HEIGHT)
    expect(resized.dino.velocityY).toBe(0)
    expect(resized.dino.isOnGround).toBe(true)
  })

  it('строит хитбокс птицы с отступами', () => {
    const bird = {
      kind: 'bird' as const,
      gap: 220,
      position: { x: 100, y: 50 },
      width: 40,
      height: 20,
    }

    const hitbox = getObstacleHitbox(bird)
    expect(hitbox.left).toBeGreaterThan(bird.position.x)
    expect(hitbox.right).toBeLessThan(bird.position.x + bird.width)
    expect(hitbox.top).toBeGreaterThan(bird.position.y)
    expect(hitbox.bottom).toBeLessThan(bird.position.y + bird.height)
  })
})
