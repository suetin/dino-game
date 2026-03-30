import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeBootstrap } from './components/ThemeBootstrap'
import { AppStore } from './store'

type AppProps = {
  children: ReactNode
  store: AppStore
}

const App = ({ children, store }: AppProps) => {
  return (
    <Provider store={store}>
      <ThemeBootstrap />
      <ErrorBoundary>{children}</ErrorBoundary>
    </Provider>
  )
}

export default App
