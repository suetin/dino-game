import React from 'react'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'

export const LeaderboardPage = () => {
  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="Лидерборд - Dino Game" description="Страница лидеров игры" />
      <h1>Таблица рекордов</h1>
      <p>Список лучших игроков</p>
    </WrapperContent>
  )
}
