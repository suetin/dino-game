import React from 'react'

export const Footer = () => {
  return (
    <footer className="flex justify-center items-center p-2 bg-secondary mt-auto border-t border-border">
      <div className="text-secondary-foreground text-sm">
        &copy; {new Date().getFullYear()} Dino Game. Все права защищены.
      </div>
    </footer>
  )
}
