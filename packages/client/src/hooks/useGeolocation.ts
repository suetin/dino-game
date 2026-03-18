import { useState, useCallback } from 'react'

interface Coordinates {
  latitude: number
  longitude: number
}

interface GeolocationError {
  code: number
  message: string
}

export const useGeolocation = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError({
        code: 0,
        message: 'Геолокация не поддерживается вашим браузером',
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setCoordinates(null)

    navigator.geolocation.getCurrentPosition(
      position => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLoading(false)
      },
      geoError => {
        setError({
          code: geoError.code,
          message: geoError.message,
        })
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  }, [])

  return { coordinates, error, isLoading, getLocation }
}
