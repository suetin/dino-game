import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { store } from './store'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
  })

  it('shows user not found when user is null', () => {
    const { getByText } = render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    expect(getByText('Пользователь не найден!')).toBeDefined()
  })
})
