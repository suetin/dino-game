import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from '@/store'
import { loginThunk, selectUser, selectAuthError, clearAuthError } from '@/slices/userSlice'
import { validatePassword } from '@/lib/validation'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/config/routes'

export const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(selectUser)
  const authError = useSelector(selectAuthError)

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ login?: string; password?: string }>({})

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || ROUTES.PROFILE
      navigate(from, { replace: true })
    }
  }, [user, navigate, location.state])

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const loginErr = login.trim() ? '' : 'Логин обязателен'
    const passwordErr = validatePassword(password)

    if (loginErr || passwordErr) {
      setErrors({
        login: loginErr || undefined,
        password: passwordErr || undefined,
      })
      return
    }

    setErrors({})
    dispatch(loginThunk({ login: login.trim(), password }))
  }

  if (user) {
    // Пока происходит редирект, ничего не рендерим
    return null
  }

  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="Вход - Dino Game" description="Форма авторизации" />
      <h1 className="text-2xl font-bold mb-4">Вход</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="login-name">Логин</Label>
          <Input
            id="login-name"
            type="text"
            placeholder="Введите логин"
            value={login}
            onChange={e => setLogin(e.target.value)}
            onBlur={() =>
              setErrors(prev => ({
                ...prev,
                login: login.trim() ? undefined : 'Логин обязателен',
              }))
            }
            autoComplete="username"
            className={errors.login ? 'border-destructive' : ''}
          />
          {errors.login && <p className="text-sm text-destructive">{errors.login}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Пароль</Label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() =>
              setErrors(prev => ({ ...prev, password: validatePassword(password) || undefined }))
            }
            autoComplete="current-password"
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        {authError && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded" role="alert">
            {authError}
          </p>
        )}
        <Button type="submit" className="w-full">
          Войти
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Нет аккаунта?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary underline underline-offset-2">
          Регистрация
        </Link>
      </p>
    </WrapperContent>
  )
}
