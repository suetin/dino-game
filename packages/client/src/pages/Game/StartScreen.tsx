import { Button } from '@/components/ui/button'

interface StartScreenProps {
  onStart: () => void
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="dino-screen dino-screen--start">
      <h2 className="dino-screen__title">Дино</h2>
      <p className="dino-screen__text">
        Избегай кактусов, нажимай Пробел или кликай, чтобы прыгать.
      </p>
      <Button size="lg" onClick={onStart} className="dino-screen__action">
        Начать
      </Button>
    </div>
  )
}
