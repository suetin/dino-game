import React from 'react'
import { Helmet } from 'react-helmet'

interface PageMetaProps {
  title?: string
  description?: string
}

export const PageMeta = ({ title, description }: PageMetaProps) => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
    </Helmet>
  )
}
