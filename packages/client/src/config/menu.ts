export interface MenuItem {
  title: string
  path: string
}

export const MENU_ITEMS: MenuItem[] = [
  { title: 'Игра', path: '/game' },
  { title: 'Лидеры', path: '/leaderboard' },
  { title: 'Форум', path: '/forum' },
  { title: 'Профиль', path: '/profile' },
]

// Отдельно выносим главную, если она нужна для мобильного меню
export const HOME_ITEM: MenuItem = { title: 'Главная', path: '/' }
