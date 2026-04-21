import { useRef, type MouseEvent } from 'react'
import { usePage } from '@/hooks/usePage'
import { useDispatch, useSelector } from '@/store'
import {
  selectGamePhase,
  selectLastScore,
  startGame,
  playAgain,
  goToMenu,
} from '@/slices/gameSlice'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { StartScreen } from './StartScreen'
import { GameOverScreen } from './GameOverScreen'
import { PlayingView } from './PlayingView'
import '../../styles/DinoGame.css'
import { useFullscreen } from '@/hooks/useFullscreen'
import { Button } from '@/components/ui/button'
import { Maximize, Minimize } from 'lucide-react'

export const GamePage = () => {
  const dispatch = useDispatch()
  const phase = useSelector(selectGamePhase)
  const lastScore = useSelector(selectLastScore)
  const pageRef = useRef<HTMLDivElement | null>(null)

  const { isFullscreen, toggleFullscreen } = useFullscreen(pageRef)

  usePage({ initPage: initGamePage })

  const handleFullscreenClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur()
    await toggleFullscreen()
  }

  const renderContent = () => {
    if (phase === 'start') {
      return <StartScreen onStart={() => dispatch(startGame())} />
    }

    if (phase === 'game_over') {
      return (
        <GameOverScreen
          score={lastScore}
          onPlayAgain={() => dispatch(playAgain())}
          onGoToMenu={() => dispatch(goToMenu())}
        />
      )
    }

    return <PlayingView />
  }

  return (
    <WrapperContent className="w-full self-stretch min-h-0 items-stretch justify-start text-center">
      <PageMeta title="Dino Game" description="Дино" />

      {/* Общий контейнер для игры и кнопки Fullscreen */}
      <div ref={pageRef} className="dino-page relative group">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFullscreenClick}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-10 gap-2 text-sm p-6 bg-border text-muted-foreground">
          {isFullscreen ? (
            <>
              <Minimize className="h-4 w-4" />
              <span>Свернуть</span>
            </>
          ) : (
            <>
              <Maximize className="h-4 w-4" />
              <span>Во весь экран</span>
            </>
          )}
        </Button>

        {renderContent()}
      </div>
    </WrapperContent>
  )
}

export const initGamePage = async () => {
  return Promise.resolve()
}
