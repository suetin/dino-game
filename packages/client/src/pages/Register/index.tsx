import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from '@/store'
import { registerThunk, selectUser, selectAuthError, clearAuthError } from '@/slices/userSlice'
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  validatePhone,
  validateLogin,
} from '@/lib/validation'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
export const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const authError = useSelector(selectAuthError)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [first_name, setName] = useState('')
  const [second_name, setSecondName] = useState('')
  const [login, setLogin] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    repeatPassword?: string
    first_name?: string
    second_name?: string
    login?: string
    phone?: string
  }>({})
  useEffect(() => {
    if (user) {
      navigate('/game', { replace: true })
    }
  }, [user, navigate])
  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    const repeatErr = validatePasswordMatch(password, repeatPassword)
    const nameErr = validateRequired(first_name, 'Имя')
    const secondNameErr = validateRequired(second_name, 'Фамилия')
    const phoneErr = validatePhone(phone)
    const loginErr = validateLogin(login)
    if (emailErr || passwordErr || repeatErr || nameErr || secondNameErr || phoneErr || loginErr) {
      setErrors({
        email: emailErr || undefined,
        password: passwordErr || undefined,
        repeatPassword: repeatErr || undefined,
        first_name: nameErr || undefined,
        second_name: secondNameErr || undefined,
        login: loginErr || undefined,
        phone: phoneErr || undefined,
      })
      return
    }
    setErrors({})
    dispatch(
      registerThunk({
        email: email.trim(),
        password,
        first_name: first_name.trim(),
        second_name: second_name.trim(),
        login: login,
        phone: phone.trim(),
      })
    )
  }
  if (user) {
    return null
  }
  return (
    <WrapperContent className="max-w-[600px] items-center justify-start text-center">
      <PageMeta title="Регистрация - Dino Game" description="Форма регистрации" />
      <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
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
          <Label htmlFor="register-login">Логин</Label>
          <Input
            id="register-login"
            type="text"
            value={login}
            onChange={e => setLogin(e.target.value)}
            onBlur={() =>
              setErrors(prev => ({ ...prev, login: validateLogin(login) || undefined }))
            }
            autoComplete="username"
            className={errors.login ? 'border-destructive' : ''}
          />
          {errors.login && <p className="text-sm text-destructive">{errors.login}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Пароль</Label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() =>
              setErrors(prev => ({ ...prev, password: validatePassword(password) || undefined }))
            }
            autoComplete="new-password"
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-repeat-password">Повторите пароль</Label>
          <Input
            id="register-repeat-password"
            type="password"
            value={repeatPassword}
            onChange={e => setRepeatPassword(e.target.value)}
            onBlur={() =>
              setErrors(prev => ({
                ...prev,
                repeatPassword: validatePasswordMatch(password, repeatPassword) || undefined,
              }))
            }
            autoComplete="new-password"
            className={errors.repeatPassword ? 'border-destructive' : ''}
          />
          {errors.repeatPassword && (
            <p className="text-sm text-destructive">{errors.repeatPassword}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-name">Имя</Label>
          <Input
            id="register-name"
            type="text"
            value={first_name}
            onChange={e => setName(e.target.value)}
            onBlur={() =>
              setErrors(prev => ({
                ...prev,
                name: validateRequired(first_name, 'Имя') || undefined,
              }))
            }
            autoComplete="given-name"
            className={errors.first_name ? 'border-destructive' : ''}
          />
          {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-secondName">Фамилия</Label>
          <Input
            id="register-secondName"
            type="text"
            value={second_name}
            onChange={e => setSecondName(e.target.value)}
            onBlur={() =>
              setErrors(prev => ({
                ...prev,
                second_name: validateRequired(second_name, 'Фамилия') || undefined,
              }))
            }
            autoComplete="family-name"
            className={errors.second_name ? 'border-destructive' : ''}
          />
          {errors.second_name && <p className="text-sm text-destructive">{errors.second_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-phone">Телефон</Label>
          <Input
            id="register-phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onBlur={() =>
              setErrors(prev => ({ ...prev, phone: validatePhone(phone) || undefined }))
            }
            autoComplete="tel"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>

        {authError && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded" role="alert">
            {authError}
          </p>
        )}
        <Button type="submit" className="w-full">
          Зарегистрироваться
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-primary underline underline-offset-2">
          Войти
        </Link>
      </p>
    </WrapperContent>
  )
}
