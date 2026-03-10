import React from 'react'
// import { useDispatch, useSelector } from '@/store'
// import { fetchServiceIdThunk, selectServiceId } from '@/slices/userSlice'
import { REDIRECT_URI } from '@/constants'
import { Button } from '@/components/ui/button'

const YANDEX_OAUTH_URL = 'https://oauth.yandex.ru/authorize'

// ВРЕМЕННОЕ РЕШЕНИЕ: Используем ID, который вы получили ранее
const MOCK_SERVICE_ID = '243f5d3b0fa04e5aa9b8ff6508db3a64'

export const OAuthButton = () => {
  // const dispatch = useDispatch()
  // const serviceId = useSelector(selectServiceId)

  // useEffect(() => {
  //   if (!serviceId) {
  //     dispatch(fetchServiceIdThunk())
  //   }
  // }, [dispatch, serviceId])

  const handleYandexLogin = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: MOCK_SERVICE_ID, // Используем "захардкоженный" ID
      redirect_uri: REDIRECT_URI,
      scope: 'login:info login:email login:avatar',
    })
    window.location.href = `${YANDEX_OAUTH_URL}?${params.toString()}`
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleYandexLogin}>
      Войти через Яндекс
    </Button>
  )
}
