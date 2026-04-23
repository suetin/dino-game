import React, { useState } from 'react'
import { useDispatch } from '@/store'
import { fetchOauthStartUrlThunk } from '@/slices/userSlice'
import { Button } from '@/components/ui/button'

export const OAuthButton = () => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const handleYandexLogin = async () => {
    setIsLoading(true)
    try {
      const authorizationUrl = await dispatch(fetchOauthStartUrlThunk()).unwrap()
      window.location.href = authorizationUrl
    } catch (error) {
      console.error('Failed to start OAuth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleYandexLogin}
      disabled={isLoading}>
      {isLoading ? 'Загрузка...' : 'Войти через Яндекс'}
    </Button>
  )
}
