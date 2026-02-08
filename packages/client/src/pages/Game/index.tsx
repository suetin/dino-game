import React, { useEffect, useRef } from 'react'
import { usePage } from '@/hooks/usePage'
import { DinoGame } from '@/games/dino/DinoGame'
import { GAME_HEIGHT, GAME_WIDTH } from '@/games/dino/constants'
import '../../styles/DinoGame.css'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'

export const GamePage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  usePage({ initPage: initGamePage })

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
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="Dino Game" description="Дино" />
      <div className="dino-page">
        <div className="dino-canvas-wrap">
          <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="dino-canvas" />
        </div>
      </div>
    </WrapperContent>
  )
}

export const initGamePage = async () => {
  return Promise.resolve()
}
