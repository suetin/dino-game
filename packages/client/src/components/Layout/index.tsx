import React, { useEffect } from 'react'
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { useDispatch } from '@/store'
import { oauthLoginThunk } from '@/slices/userSlice'
import { ROUTES } from '@/config/routes'

export const Layout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const code = searchParams.get('code')
  const state = searchParams.get('state')

  useEffect(() => {
    if (!code || !state) {
      return
    }

    const handledStateKey = `oauth:handled:${state}`
    if (sessionStorage.getItem(handledStateKey) === '1') {
      return
    }
    sessionStorage.setItem(handledStateKey, '1')

    const handleOAuthCallback = async () => {
      try {
        await dispatch(oauthLoginThunk({ code, state })).unwrap()
        navigate(ROUTES.PROFILE, { replace: true })
      } catch (err) {
        console.error('OAuth Error:', err)
        const authError = typeof err === 'string' ? err : 'Ошибка OAuth'
        navigate(ROUTES.LOGIN, { replace: true, state: { authError } })
      }
    }

    handleOAuthCallback()
  }, [code, state, dispatch, navigate])

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
