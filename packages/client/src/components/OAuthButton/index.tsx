import React, { useState } from 'react'
import { useDispatch } from '@/store'
import { fetchServiceIdThunk } from '@/slices/userSlice'
import { REDIRECT_URI } from '@/constants'
import { Button } from '@/components/ui/button'

const YANDEX_OAUTH_URL = 'https://oauth.yandex.ru/authorize'
const YANDEX_OAUTH_SCOPES = 'login:info login:email login:avatar'

export const OAuthButton = () => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const handleYandexLogin = async () => {
    setIsLoading(true)
    try {
      // 1. Получаем service_id
      const serviceId = 'e6fbef6d71bb475289408b575a0bf8b0'

      // 2. Формируем URL и делаем редирект
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: serviceId,
        redirect_uri: REDIRECT_URI,
        scope: YANDEX_OAUTH_SCOPES, // ДОБАВЛЕНО: запрашиваем расширенные права
      })

      window.location.href = `${YANDEX_OAUTH_URL}?${params.toString()}`
    } catch (error) {
      console.error('Failed to get service_id:', error)
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
