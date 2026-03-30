import React from 'react'
import ReactDOM from 'react-dom/server'
import { Helmet } from 'react-helmet'
import { Request as ExpressRequest } from 'express'
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server'
import { matchRoutes, RouteObject } from 'react-router-dom'

import App from './App'
import { createContext, createFetchRequest, createUrl } from './entry-server.utils'
import { routes, PageInitArgs } from './routes'
import { createAppStore } from './store'
import { setPageHasBeenInitializedOnServer } from './slices/ssrSlice'
import './index.css'

type AppRouteObject = RouteObject & {
  fetchData?: (args: PageInitArgs) => Promise<unknown>
}

type RenderResponseResult = {
  response: Response
}

type RenderHtmlResult = {
  html: string
  helmet: ReturnType<typeof Helmet.renderStatic>
  initialState: ReturnType<ReturnType<typeof createAppStore>['getState']>
}

function findMatchedRouteFetchData(req: ExpressRequest) {
  const url = createUrl(req)
  const foundRoutes = matchRoutes(routes, url)

  if (!foundRoutes) {
    throw new Error('Страница не найдена!')
  }

  const routeWithFetchData = foundRoutes.find(({ route }) => (route as AppRouteObject).fetchData)
  return (routeWithFetchData?.route as AppRouteObject)?.fetchData
}

async function initializeMatchedRoute(
  req: ExpressRequest,
  store: ReturnType<typeof createAppStore>
) {
  const fetchData = findMatchedRouteFetchData(req)

  if (!fetchData) {
    return
  }

  try {
    await fetchData({
      dispatch: store.dispatch,
      state: store.getState(),
      ctx: createContext(req),
    })
  } catch (error) {
    console.log('Инициализация страницы произошла с ошибкой', error)
  }
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
  await initializeMatchedRoute(req, store)
  store.dispatch(setPageHasBeenInitializedOnServer(true))

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
