import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeBootstrap } from './components/ThemeBootstrap'

import { routes } from './routes'
import './index.css'

const router = createBrowserRouter(routes)

const root = document.getElementById('root') as HTMLElement
const app = (
  <Provider store={store}>
    <ThemeBootstrap />
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </Provider>
)

ReactDOM.hydrateRoot(root, import.meta.env.DEV ? <React.StrictMode>{app}</React.StrictMode> : app)
