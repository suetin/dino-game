import { useEffect, useRef } from 'react'
import { usePage } from '@/hooks/usePage'
import { DinoGame } from '@/games/dino/DinoGame'
import { GAME_HEIGHT, GAME_WIDTH } from '@/games/dino/constants'
import '../../styles/DinoGame.css'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'

const MIN_CANVAS_WIDTH = 320
const MIN_CANVAS_HEIGHT = 240

const getCanvasSize = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  return {
    width: Math.max(MIN_CANVAS_WIDTH, Math.floor(rect.width || GAME_WIDTH)),
    height: Math.max(MIN_CANVAS_HEIGHT, Math.floor(rect.height || GAME_HEIGHT)),
  }
}

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  )
}

export const GamePage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement | null>(null)

  usePage({ initPage: initGamePage })

  useEffect(() => {
    const canvas = canvasRef.current
    const canvasWrap = canvasWrapRef.current
    if (!canvas || !canvasWrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const applyCanvasResolution = (width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const initialSize = getCanvasSize(canvasWrap)
    applyCanvasResolution(initialSize.width, initialSize.height)

    const game = new DinoGame(ctx, {
      width: initialSize.width,
      height: initialSize.height,
    })
    game.renderStartHint()

    let hasStarted = false
    let isGameOver = false

    const onGameOver = (score: number) => {
      isGameOver = true
      console.log('Игра закончилась. Очки:', score)
    }

    const startGame = () => {
      hasStarted = true
      console.log('Игра началась')
      game.start()
    }

    const restartGame = () => {
      isGameOver = false
      game.reset()
      game.start()
    }

    const requestJump = () => {
      if (!hasStarted || isGameOver) return
      game.requestJump()
    }

    const handlePrimaryAction = () => {
      if (!hasStarted) {
        startGame()
        return
      }
      if (isGameOver) {
        restartGame()
        return
      }
      requestJump()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return
      }

      if (event.repeat) {
        return
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          handlePrimaryAction()
          return
        case 'ArrowUp':
          event.preventDefault()
          requestJump()
          return
        case 'KeyR':
          if (isGameOver) {
            restartGame()
          }
          return
        default:
          return
      }
    }

    const syncCanvasSize = () => {
      const nextSize = getCanvasSize(canvasWrap)
      const nextWidth = nextSize.width
      const nextHeight = nextSize.height

      if (canvas.clientWidth === nextWidth && canvas.clientHeight === nextHeight) {
        return
      }

      applyCanvasResolution(nextWidth, nextHeight)
      game.resize(nextWidth, nextHeight)
      if (!hasStarted) {
        game.renderStartHint()
      }
    }

    const resizeObserver = new ResizeObserver(syncCanvasSize)
    resizeObserver.observe(canvasWrap)
    syncCanvasSize()

    canvas.addEventListener('pointerdown', handlePrimaryAction)
    window.addEventListener('keydown', onKeyDown)
    game.on('gameover', onGameOver)

    return () => {
      game.stop()
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', handlePrimaryAction)
      window.removeEventListener('keydown', onKeyDown)
      game.off('gameover', onGameOver)
    }
  }, [])

  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="Dino Game" description="Дино" />
      <div className="dino-page">
        <div ref={canvasWrapRef} className="dino-canvas-wrap">
          <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="dino-canvas" />
        </div>
      </div>
    </WrapperContent>
  )
}

export const initGamePage = async () => {
  return Promise.resolve()
}
