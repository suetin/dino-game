import { useEffect, useMemo, useRef } from 'react'
import { usePage } from '@/hooks/usePage'
import { useDispatch, useSelector } from '@/store'
import {
  selectGamePhase,
  selectLastScore,
  startGame,
  finishGame,
  playAgain,
  goToMenu,
} from '@/slices/gameSlice'
import { selectIsDarkMode } from '@/slices/themeSlice'
import { DinoGame } from '@/games/dino/DinoGame'
import { GAME_HEIGHT, GAME_WIDTH } from '@/games/dino/constants'
import { getDinoGameThemeTokens } from '@/games/dino/theme'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { StartScreen } from './StartScreen'
import { GameOverScreen } from './GameOverScreen'
import '../../styles/DinoGame.css'

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

const PlayingView = () => {
  const dispatch = useDispatch()
  const isDarkMode = useSelector(selectIsDarkMode)
  const gameTheme = useMemo(() => getDinoGameThemeTokens(isDarkMode), [isDarkMode])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<DinoGame | null>(null)
  const initialThemeRef = useRef(gameTheme)

  useEffect(() => {
    let cancelled = false
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
      theme: initialThemeRef.current,
    })
    gameRef.current = game

    const onGameOver = (score: number) => {
      if (!cancelled) dispatch(finishGame(score))
    }

    game.on('gameover', onGameOver)
    game.start()

    const requestJump = () => {
      game.requestJump()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.repeat) return
      switch (event.code) {
        case 'Space':
        case 'ArrowUp':
          event.preventDefault()
          requestJump()
          return
        default:
          return
      }
    }

    const syncCanvasSize = () => {
      const nextSize = getCanvasSize(canvasWrap)
      const nextWidth = nextSize.width
      const nextHeight = nextSize.height
      if (canvas.clientWidth === nextWidth && canvas.clientHeight === nextHeight) return
      applyCanvasResolution(nextWidth, nextHeight)
      game.resize(nextWidth, nextHeight)
    }

    const resizeObserver = new ResizeObserver(syncCanvasSize)
    resizeObserver.observe(canvasWrap)
    syncCanvasSize()

    canvas.addEventListener('pointerdown', requestJump)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      cancelled = true
      game.stop()
      gameRef.current = null
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', requestJump)
      window.removeEventListener('keydown', onKeyDown)
      game.off('gameover', onGameOver)
    }
  }, [dispatch])

  useEffect(() => {
    gameRef.current?.setTheme(gameTheme)
  }, [gameTheme])

  return (
    <div className="dino-page">
      <div ref={canvasWrapRef} className="dino-canvas-wrap">
        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="dino-canvas" />
      </div>
    </div>
  )
}

export const GamePage = () => {
  const dispatch = useDispatch()
  const phase = useSelector(selectGamePhase)
  const lastScore = useSelector(selectLastScore)

  usePage({ initPage: initGamePage })

  if (phase === 'start') {
    return (
      <WrapperContent className="w-full self-stretch min-h-0 items-stretch justify-start text-center">
        <PageMeta title="Dino Game" description="Дино" />
        <div className="dino-page">
          <StartScreen onStart={() => dispatch(startGame())} />
        </div>
      </WrapperContent>
    )
  }

  if (phase === 'game_over') {
    return (
      <WrapperContent className="w-full self-stretch min-h-0 items-stretch justify-start text-center">
        <PageMeta title="Dino Game" description="Дино" />
        <div className="dino-page">
          <GameOverScreen
            score={lastScore}
            onPlayAgain={() => dispatch(playAgain())}
            onGoToMenu={() => dispatch(goToMenu())}
          />
        </div>
      </WrapperContent>
    )
  }

  return (
    <WrapperContent className="w-full self-stretch min-h-0 items-stretch justify-start text-center">
      <PageMeta title="Dino Game" description="Дино" />
      <PlayingView />
    </WrapperContent>
  )
}

export const initGamePage = async () => {
  return Promise.resolve()
}
