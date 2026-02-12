import React from 'react'
import { PageMeta } from '@/components/PageMeta'
import { WrapperContent } from '@/components/WrapperContent'

export const RegisterPage = () => {
  return (
    <WrapperContent className="max-w-[600px] items-center justify-center text-center">
      <PageMeta title="Регистрация - Dino Game" description="Форма регистрации" />
      <h1>Регистрация</h1>
      <p>Здесь будет форма регистрации</p>
    </WrapperContent>
  )
}
