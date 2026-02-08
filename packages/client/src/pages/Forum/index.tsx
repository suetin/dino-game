import React from 'react'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'

export const ForumPage = () => {
  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="Форум - Dino Game" description="Форум" />
      <h1>Форум</h1>
      <p>Обсуждение игры и не только</p>
    </WrapperContent>
  )
}
