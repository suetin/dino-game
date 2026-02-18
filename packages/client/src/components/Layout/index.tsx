import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../Header'
import { Footer } from '../Footer'

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
