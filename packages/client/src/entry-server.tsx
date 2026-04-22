import React from 'react'
import ReactDOM from 'react-dom/server'
import { Helmet } from 'react-helmet'
import { Request as ExpressRequest } from 'express'
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server'

import App from './App'
import { createFetchRequest } from './entry-server.utils'
import { routes } from './routes'
import { createAppStore } from './store'
import './index.css'

type RenderResponseResult = {
  response: Response
}

type RenderHtmlResult = {
  html: string
  helmet: ReturnType<typeof Helmet.renderStatic>
  initialState: ReturnType<ReturnType<typeof createAppStore>['getState']>
}

export const render = async (
  req: ExpressRequest
): Promise<RenderResponseResult | RenderHtmlResult> => {
  const { query, dataRoutes } = createStaticHandler(routes)
  const fetchRequest = createFetchRequest(req)
  const context = await query(fetchRequest)

  if (context instanceof Response) {
    return {
      response: context,
    }
  }

  const store = createAppStore()

  const router = createStaticRouter(dataRoutes, context)
  const html = ReactDOM.renderToString(
    <App store={store}>
      <StaticRouterProvider router={router} context={context} />
    </App>
  )
  const helmet = Helmet.renderStatic()

  return {
    html,
    helmet,
    initialState: store.getState(),
  }
}
