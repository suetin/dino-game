import React from 'react'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'

export const LoginPage = () => {
  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="Вход - Dino Game" description="Форма авторизации" />
      <h1>Вход</h1>
      <p>Здесь будет форма авторизации</p>
    </WrapperContent>
  )
}
