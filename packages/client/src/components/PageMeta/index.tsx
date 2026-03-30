import React, { ComponentType, PropsWithChildren } from 'react'
import { Helmet } from 'react-helmet'

interface PageMetaProps {
  title?: string
  description?: string
}

// react-helmet has outdated JSX typings for our current React/tooling setup,
// so we adapt it once here instead of spreading casts across the app.
const HelmetComponent = Helmet as unknown as ComponentType<PropsWithChildren>

export const PageMeta = ({ title, description }: PageMetaProps) => {
  return (
    <HelmetComponent>
      <meta charSet="utf-8" />
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
    </HelmetComponent>
  )
}
