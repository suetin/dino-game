import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const ProtectedRoute = () => {
  const { isAuth, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    // Можно вернуть спиннер или null, пока проверяется авторизация
    return <div>Loading...</div>
  }

  if (!isAuth) {
    // Перенаправляем на логин, сохраняя информацию о том, куда пользователь хотел попасть
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
