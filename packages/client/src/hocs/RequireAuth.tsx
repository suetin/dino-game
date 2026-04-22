import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'

export const RequireAuth = () => {
  const { isAuth, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (!isAuth) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}
