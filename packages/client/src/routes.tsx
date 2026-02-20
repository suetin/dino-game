import { Layout } from './components/Layout'
import { GameLayout } from './components/GameLayout'
import { RequireAuth } from './hocs/RequireAuth'
import { MainPage } from './pages/Main'
import { initGamePage, GamePage } from './pages/Game'
import { initNotFoundPage, NotFoundPage } from './pages/NotFound'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { initProfilePage, ProfilePage } from './pages/Profile'
import { LeaderboardPage } from './pages/Leaderboard'
import { ForumPage } from './pages/Forum'
import { Error500Page } from './pages/Error500'
import { ROUTES } from './config/routes'
import { AppDispatch, RootState } from './store'

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
    path: ROUTES.HOME,
    element: <Layout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: ROUTES.ERROR_500,
        element: <Error500Page />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
            fetchData: initProfilePage,
          },
          {
            path: ROUTES.LEADERBOARD,
            element: <LeaderboardPage />,
          },
          {
            path: ROUTES.FORUM,
            element: <ForumPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
        fetchData: initNotFoundPage,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.GAME,
        element: <GameLayout />,
        children: [
          {
            index: true,
            element: <GamePage />,
            fetchData: initGamePage,
          },
        ],
      },
    ],
  },
]
