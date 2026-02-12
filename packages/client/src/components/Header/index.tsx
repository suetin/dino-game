import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Menu } from 'lucide-react'
import { useDispatch, useSelector } from '@/store'
import { selectIsDarkMode, toggleTheme } from '@/slices/themeSlice'
import logoHeaderImg from '@/assets/images/logo_header.png'
import { MENU_ITEMS, HOME_ITEM } from '@/config/menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Header = () => {
  const dispatch = useDispatch()
  const isDarkMode = useSelector(selectIsDarkMode)
  const location = useLocation()

  const handleSetTheme = (targetIsDark: boolean) => {
    if (isDarkMode !== targetIsDark) {
      dispatch(toggleTheme())
    }
  }

  // Генерируем карту имен страниц из конфига
  const pageNameMap = useMemo(() => {
    const map: Record<string, string> = {
      [HOME_ITEM.path]: HOME_ITEM.title,
    }
    MENU_ITEMS.forEach(item => {
      map[item.path] = item.title
    })
    return map
  }, [])

  const currentPageName = pageNameMap[location.pathname] || 'Меню'

  return (
    <header className="flex justify-between items-center px-4 md:px-8 py-4 bg-primary border-b border-border shadow-sm">
      <div className="flex items-center gap-4 md:gap-8">
        <Link to={HOME_ITEM.path} className="hover:opacity-80 transition-opacity">
          <img src={logoHeaderImg} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
        </Link>

        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {MENU_ITEMS.map(item => (
                <NavigationMenuItem key={item.path}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to={item.path}>{item.title}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Menu className="h-4 w-4" />
                <span>{currentPageName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link to={HOME_ITEM.path}>{HOME_ITEM.title}</Link>
              </DropdownMenuItem>
              {MENU_ITEMS.map(item => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path}>{item.title}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Переключить тему</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSetTheme(false)}>
            Светлая тема {!isDarkMode && '✓'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetTheme(true)}>
            Темная тема {isDarkMode && '✓'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
