import { AppDispatch, RootState } from './store'

import { initMainPage, MainPage } from './pages/Main'
import { initFriendsPage, FriendsPage } from './pages/FriendsPage'
import { initDinoGamePage, DinoGamePage } from './pages/DinoGame'
import { initNotFoundPage, NotFoundPage } from './pages/NotFound'

export type PageInitContext = {
  clientToken?: string
}

export type PageInitArgs = {
  dispatch: AppDispatch
  state: RootState
  ctx: PageInitContext
}

export const routes = [
  {
    path: '/',
    Component: MainPage,
    fetchData: initMainPage,
  },
  {
    path: '/friends',
    Component: FriendsPage,
    fetchData: initFriendsPage,
  },
  {
    path: '/dino',
    Component: DinoGamePage,
    fetchData: initDinoGamePage,
  },
  {
    path: '*',
    Component: NotFoundPage,
    fetchData: initNotFoundPage,
  },
]
