import React from 'react'
import ReactDOM from 'react-dom/server'
import { Provider } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Request as ExpressRequest } from 'express'
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server'
import { matchRoutes, RouteObject } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'

import { createContext, createFetchRequest, createUrl } from './entry-server.utils'
import { reducer } from './store'
import { routes, PageInitArgs } from './routes'
import { setPageHasBeenInitializedOnServer } from './slices/ssrSlice'
import './index.css'

// Расширяем стандартный тип RouteObject, добавляя наше поле fetchData
type AppRouteObject = RouteObject & {
  fetchData?: (args: PageInitArgs) => Promise<unknown>
}

export const render = async (req: ExpressRequest) => {
  const { query, dataRoutes } = createStaticHandler(routes)
  const fetchRequest = createFetchRequest(req)
  const context = await query(fetchRequest)

  if (context instanceof Response) {
    throw context
  }

  const store = configureStore({
    reducer,
  })

  const url = createUrl(req)

  const foundRoutes = matchRoutes(routes, url)
  if (!foundRoutes) {
    throw new Error('Страница не найдена!')
  }

  // Ищем маршрут, у которого есть метод fetchData
  const routeWithFetchData = foundRoutes.find(({ route }) => (route as AppRouteObject).fetchData)

  const fetchData = (routeWithFetchData?.route as AppRouteObject)?.fetchData

  if (fetchData) {
    try {
      await fetchData({
        dispatch: store.dispatch,
        state: store.getState(),
        ctx: createContext(req),
      })
    } catch (e) {
      console.log('Инициализация страницы произошла с ошибкой', e)
    }
  }

  store.dispatch(setPageHasBeenInitializedOnServer(true))

  const router = createStaticRouter(dataRoutes, context)

  const html = ReactDOM.renderToString(
    <Provider store={store}>
      <StaticRouterProvider router={router} context={context} />
    </Provider>
  )

  const helmet = Helmet.renderStatic()

  return {
    html,
    helmet,
    styleTags: '',
    initialState: store.getState(),
  }
}
