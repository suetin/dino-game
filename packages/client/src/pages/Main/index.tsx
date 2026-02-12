import React from 'react'
import { Link } from 'react-router-dom'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { Button } from '@/components/ui/button'
import gameNameImg from '@/assets/images/game_name.png'

export const MainPage = () => {
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

      <p>
        Перед вами клиентское SPA-приложение с 2D-игрой на Canvas, авторизацией, профилем
        пользователя, лидербордом и форумом.
      </p>
      <p>
        Проект разрабатывается командой в рамках учебного курса и ориентирован на реальные практики
        командной frontend/backend-разработки.
      </p>

      <Button size="lg" variant="outline" asChild>
        <Link to="/login">Войти</Link>
      </Button>
    </WrapperContent>
  )
}
