import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeBootstrap } from './components/ThemeBootstrap'
import { startServiceWorker } from './startServiceWorker'

import { routes } from './routes'
import './index.css'

const router = createBrowserRouter(routes)

startServiceWorker()

ReactDOM.hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <Provider store={store}>
    <ThemeBootstrap />
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </Provider>
)
