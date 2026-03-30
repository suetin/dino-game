import React, { useEffect } from 'react'
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { useDispatch } from '@/store'
import { fetchUserThunk, oauthLoginThunk } from '@/slices/userSlice'
import { ROUTES } from '@/config/routes'

export const Layout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const code = searchParams.get('code')

  useEffect(() => {
    if (code) {
      return
    }

    dispatch(fetchUserThunk())
  }, [code, dispatch])

  useEffect(() => {
    if (!code) {
      return
    }

    const handleOAuthCallback = async () => {
      try {
        await dispatch(oauthLoginThunk(code)).unwrap()
        await dispatch(fetchUserThunk()).unwrap()
        navigate(ROUTES.PROFILE, { replace: true })
      } catch (err) {
        console.error('OAuth Error:', err)
        navigate(ROUTES.LOGIN, { replace: true })
      }
    }

    handleOAuthCallback()
  }, [code, dispatch, navigate])

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
