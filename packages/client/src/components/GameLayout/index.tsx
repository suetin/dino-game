import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'

export const GameLayout = () => {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
