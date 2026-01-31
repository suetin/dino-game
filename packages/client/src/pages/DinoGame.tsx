import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet'

import { Header } from '../components/Header'
import { usePage } from '../hooks/usePage'
import { DinoGame } from '../games/dino/DinoGame'
import { GAME_HEIGHT, GAME_WIDTH } from '../games/dino/constants'
import '../styles/DinoGame.css'

export const DinoGamePage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  usePage({ initPage: initDinoGamePage })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const game = new DinoGame(ctx, {
      width: canvas.width,
      height: canvas.height,
    })

    const onClick = () => game.requestJump()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        game.requestJump()
      }
      if (event.code === 'KeyR') {
        game.reset()
      }
    }

    canvas.addEventListener('pointerdown', onClick)
    window.addEventListener('keydown', onKeyDown)

    game.start()

    return () => {
      game.stop()
      canvas.removeEventListener('pointerdown', onClick)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div className="dino-page">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Dino Game</title>
        <meta name="description" content="Дино" />
      </Helmet>
      <Header />
      <div className="dino-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="dino-canvas"
        />
      </div>
    </div>
  )
}

export const initDinoGamePage = async () => {
  return Promise.resolve()
}
