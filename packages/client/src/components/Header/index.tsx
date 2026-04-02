import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from '@/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { selectUser, logoutThunk } from '@/slices/userSlice'
import { selectTheme, setThemeThunk } from '@/slices/themeSlice'

const navLinkClass = (isActive: boolean) =>
  isActive
    ? 'text-primary font-medium'
    : 'text-foreground/80 transition-colors hover:text-foreground'

export const Header = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const user = useSelector(selectUser)
  const theme = useSelector(selectTheme)

  const handleLogout = async () => {
    await dispatch(logoutThunk())
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <Link to={ROUTES.HOME} className="shrink-0 text-xl font-bold text-foreground">
            Dino Game
          </Link>

          <nav className="flex items-center gap-6">
            <Link to={ROUTES.GAME} className={navLinkClass(location.pathname === ROUTES.GAME)}>
              Игра
            </Link>

            <Link
              to={ROUTES.LEADERBOARD}
              className={navLinkClass(location.pathname === ROUTES.LEADERBOARD)}>
              Лидерборд
            </Link>

            {user ? (
              <Link
                to={ROUTES.PROFILE}
                className={navLinkClass(location.pathname === ROUTES.PROFILE)}>
                Профиль
              </Link>
            ) : null}

            {user ? (
              <Link to={ROUTES.FORUM} className={navLinkClass(location.pathname === ROUTES.FORUM)}>
                Форум
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" type="button">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Переключить тему</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => dispatch(setThemeThunk('light'))}>
                Светлая тема {theme === 'light' && '✓'}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => dispatch(setThemeThunk('dark'))}>
                Тёмная тема {theme === 'dark' && '✓'}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => dispatch(setThemeThunk('ocean'))}>
                Ocean тема {theme === 'ocean' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <Button type="button" variant="outline" onClick={handleLogout}>
              Выйти
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" type="button">
                <Link to={ROUTES.LOGIN}>Войти</Link>
              </Button>

              <Button asChild type="button">
                <Link to={ROUTES.REGISTER}>Регистрация</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
