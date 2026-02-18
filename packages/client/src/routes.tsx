import { AppDispatch, RootState } from './store'

import { Layout } from './components/Layout'
import { GameLayout } from './components/GameLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainPage } from './pages/Main'
import { initGamePage, GamePage } from './pages/Game'
import { initNotFoundPage, NotFoundPage } from './pages/NotFound'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { initProfilePage, ProfilePage } from './pages/Profile'
import { LeaderboardPage } from './pages/Leaderboard'
import { ForumPage } from './pages/Forum'
import { Error500Page } from './pages/Error500'

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
    Component: Layout,
    children: [
      {
        index: true,
        Component: MainPage,
      },
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'register',
        Component: RegisterPage,
      },
      {
        path: '500',
        Component: Error500Page,
      },
      // Защищенные маршруты
      {
        Component: ProtectedRoute,
        children: [
          {
            path: 'profile',
            Component: ProfilePage,
            fetchData: initProfilePage,
          },
          {
            path: 'leaderboard',
            Component: LeaderboardPage,
          },
          {
            path: 'forum',
            Component: ForumPage,
          },
        ],
      },
      {
        path: '*',
        Component: NotFoundPage,
        fetchData: initNotFoundPage,
      },
    ],
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: 'game',
        Component: GameLayout,
        children: [
          {
            index: true,
            Component: GamePage,
            fetchData: initGamePage,
          },
        ],
      },
    ],
  },
]
