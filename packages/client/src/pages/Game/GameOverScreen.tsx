import { Button } from '@/components/ui/button'

interface GameOverScreenProps {
  score: number
  onPlayAgain: () => void
  onGoToMenu: () => void
}

export const GameOverScreen = ({ score, onPlayAgain, onGoToMenu }: GameOverScreenProps) => {
  return (
    <div className="dino-screen dino-screen--game-over">
      <h2 className="dino-screen__title">Конец игры</h2>
      <p className="dino-screen__score">Результат: {score}</p>
      <div className="dino-screen__actions">
        <Button size="lg" onClick={onPlayAgain} className="dino-screen__action">
          Сыграть ещё
        </Button>
        <Button size="lg" variant="outline" onClick={onGoToMenu} className="dino-screen__action">
          В меню
        </Button>
      </div>
    </div>
  )
}
