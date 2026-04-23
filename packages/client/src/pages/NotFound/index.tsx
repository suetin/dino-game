import React from 'react'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'

export const NotFoundPage = () => {
  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="404" description="Страница не найдена" />
      <h1>404</h1>
      <p>Страница не найдена!</p>
    </WrapperContent>
  )
}
