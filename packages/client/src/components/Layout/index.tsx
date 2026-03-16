import React, { useEffect } from 'react'
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { useDispatch } from '@/store'
import { fetchUserThunk, oauthLoginThunk } from '@/slices/userSlice'
import { ROUTES } from '@/config/routes'
import { ClientOnly } from '@/components/ClientOnly'

export const Layout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')

    if (code) {
      dispatch(oauthLoginThunk(code))
        .unwrap()
        .then(() => {
          // После успешного обмена кода на сессию, запрашиваем данные пользователя
          return dispatch(fetchUserThunk()).unwrap()
        })
        .then(() => {
          // Данные получены, перенаправляем в профиль
          navigate(ROUTES.PROFILE, { replace: true })
        })
        .catch(err => {
          console.error('OAuth Error:', err)
          // Если что-то пошло не так, отправляем на страницу логина
          navigate(ROUTES.LOGIN, { replace: true })
        })
    } else {
      // Сценарий 2: Обычная загрузка страницы.
      // Просто проверяем, есть ли у нас действующая сессия.
      dispatch(fetchUserThunk())
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <ClientOnly>
        <Header />
      </ClientOnly>
      <main className="flex-1 flex flex-col items-center justify-start p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
