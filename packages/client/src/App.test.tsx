import React from 'react'
import { render } from '@testing-library/react'

import { createAppStore } from './store'
import App from './App'

describe('App', () => {
  const store = createAppStore()

  it('renders without crashing', () => {
    render(<App store={store}>content</App>)
  })

  it('renders children inside the shared app shell', () => {
    const { getByText } = render(<App store={store}>content</App>)

    expect(getByText('content')).toBeDefined()
  })
})
