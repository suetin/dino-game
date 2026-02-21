import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'
import { fetchUserThunk } from '@/slices/userSlice'

export const RequireAuth = () => {
  const dispatch = useDispatch()
  const { isAuth, isLoading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (isLoading) {
      dispatch(fetchUserThunk() as any)
    }
  }, [dispatch])
  if (isLoading) {
    // Можно добавить компонент загрузки
    return <div>Loading...</div>
  }

  if (!isAuth) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}
