import React from 'react'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'

export const Error500Page = () => {
  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="Ошибка 500 - Dino Game" description="Ошибка 500" />
      <h1>500</h1>
      <p>Внутренняя ошибка сервера. Мы уже чиним!</p>
    </WrapperContent>
  )
}
