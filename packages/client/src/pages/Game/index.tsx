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
