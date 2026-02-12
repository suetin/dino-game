import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from '@/store'
import { selectUser } from '@/slices/userSlice'

export const ProtectedRoute = () => {
  const user = useSelector(selectUser)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
