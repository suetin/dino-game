import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  login: string
  // Добавьте другие поля пользователя
}

interface AuthContextType {
  user: User | null
  signin: (newUser: User, callback: VoidFunction) => void
  signout: (callback: VoidFunction) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Здесь должна быть логика проверки авторизации при загрузке приложения
    // Например, запрос к API /auth/user или проверка localStorage
    const checkAuth = async () => {
      try {
        // Имитация асинхронной проверки
        // const response = await AuthService.getUser();
        // setUser(response.data);
      } catch (error) {
        console.error('Not authorized')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signin = (newUser: User, callback: VoidFunction) => {
    setUser(newUser)
    callback()
  }

  const signout = (callback: VoidFunction) => {
    setUser(null)
    callback()
  }

  return (
    <AuthContext.Provider value={{ user, signin, signout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
