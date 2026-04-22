import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App'
import { startServiceWorker } from './startServiceWorker'
import { routes } from './routes'
import { store } from './store'
import './index.css'

const router = createBrowserRouter(routes)

startServiceWorker()

const root = document.getElementById('root') as HTMLElement
const app = (
  <App store={store}>
    <RouterProvider router={router} />
  </App>
)

ReactDOM.hydrateRoot(root, import.meta.env.DEV ? <React.StrictMode>{app}</React.StrictMode> : app)
