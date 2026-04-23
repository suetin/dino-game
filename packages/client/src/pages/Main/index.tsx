import React, { useState } from 'react'
import { Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/toast'
import gameNameImg from '@/assets/images/game_name.png'
import { share } from '@/lib/share'
import { selectUser } from '@/slices/userSlice'
import { useSelector } from '@/store'

export const MainPage = () => {
  const user = useSelector(selectUser)
  const [isLoading, setIsLoading] = useState(false)
  const [isShareToastOpen, setIsShareToastOpen] = useState(false)
  const [shareToastKey, setShareToastKey] = useState(0)

  const handleShare = async () => {
    setShareToastKey(currentValue => currentValue + 1)
    setIsShareToastOpen(true)

    const shareUrl = window.location.origin
    setIsLoading(true)

    try {
      await share({
        title: 'Увлекательный Dino Runner от CodeStorm',
        text: 'Беги, прыгай и попробуй побить рекорд в Dino Runner',
        url: shareUrl,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <WrapperContent className="max-w-[600px] items-center justify-center text-center">
      <PageMeta title="Dino Game" description="Игра Dino Runner" />

      <img
        src={gameNameImg}
        alt="Dino Game Logo"
        className="max-w-full h-auto w-[300px] object-contain mb-3"
        loading="lazy"
      />

      <h1>
        Dino Game
        <br />
        <span className="text-2xl">командный SPA-проект</span>
      </h1>

      {user && <h3>Привет, {user.first_name}!</h3>}

      <p>
        Перед вами клиентское SPA-приложение с 2D-игрой на Canvas, авторизацией, профилем
        пользователя, лидербордом и форумом.
      </p>
      <p>
        Проект разрабатывается командой в рамках учебного курса и ориентирован на реальные практики
        командной frontend/backend-разработки.
      </p>

      <Toast
        key={shareToastKey}
        open={isShareToastOpen}
        onOpenChange={setIsShareToastOpen}
        message="Спасибо что поделились игрой!"
        variant="success"
      />

      <div className="flex flex-wrap items-center justify-center gap-3">
        {!user && (
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Войти</Link>
          </Button>
        )}

        {user && (
          <Button size="lg" asChild>
            <Link to="/game">Играть</Link>
          </Button>
        )}

        <Button size="lg" variant="secondary" onClick={handleShare} disabled={isLoading}>
          <Share2 className="h-4 w-4" />
          {isLoading ? 'Загрузка...' : 'Поделиться игрой'}
        </Button>
      </div>
    </WrapperContent>
  )
}
