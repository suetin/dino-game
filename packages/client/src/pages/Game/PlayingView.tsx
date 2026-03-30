import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from '@/store'
import { selectIsDarkMode } from '@/slices/themeSlice'
import { finishGame } from '@/slices/gameSlice'
import { selectUser } from '@/slices/userSlice'
import { submitLeaderboardResultThunk } from '@/slices/leaderboardSlice'
import { DinoGame } from '@/games/dino/DinoGame'
import { GAME_HEIGHT, GAME_WIDTH } from '@/games/dino/constants'
import { getDinoGameThemeTokens } from '@/games/dino/theme'

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

export const PlayingView = () => {
  const dispatch = useDispatch()
  const isDarkMode = useSelector(selectIsDarkMode)
  const user = useSelector(selectUser)

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

    const onGameOver = async (score: number) => {
      if (cancelled) return

      dispatch(finishGame(score))

      const playerName =
        user?.displayName ||
        [user?.first_name, user?.second_name].filter(Boolean).join(' ').trim() ||
        user?.login ||
        user?.email ||
        'Anonymous'

      try {
        await dispatch(
          submitLeaderboardResultThunk({
            name: playerName,
            score,
          })
        )
      } catch (error) {
        console.error('Не удалось отправить результат в leaderboard', error)
      }
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
  }, [dispatch, user])

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
