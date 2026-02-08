import { Helmet } from 'react-helmet'

import { usePage } from '@/hooks/usePage'
import React from 'react'
import { WrapperContent } from '@/components/WrapperContent'

export const NotFoundPage = () => {
  usePage({ initPage: initNotFoundPage })

  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <Helmet>
        <meta charSet="utf-8" />
        <title>404</title>
        <meta name="description" content="Страница не найдена" />
      </Helmet>
      <h1>404</h1>
      <p>Страница не найдена!</p>
    </WrapperContent>
  )
}

export const initNotFoundPage = () => Promise.resolve()
