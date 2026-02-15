import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from '@/store'
import { loginThunk, selectUser, selectAuthError, clearAuthError } from '@/slices/userSlice'
import { validateEmail, validatePassword } from '@/lib/validation'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const authError = useSelector(selectAuthError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  // Редирект авторизованного пользователя с страницы логина или после успешного входа
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    if (emailErr || passwordErr) {
      setErrors({
        email: emailErr || undefined,
        password: passwordErr || undefined,
      })
      return
    }
    setErrors({})
    dispatch(loginThunk({ email: email.trim(), password }))
  }

  if (user) {
    return null
  }

  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="Вход - Dino Game" description="Форма авторизации" />
      <h1 className="text-2xl font-bold mb-4">Вход</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() =>
              setErrors(prev => ({ ...prev, email: validateEmail(email) || undefined }))
            }
            autoComplete="email"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
        <Link to="/register" className="text-primary underline underline-offset-2">
          Регистрация
        </Link>
      </p>
    </WrapperContent>
  )
}
