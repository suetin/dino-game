import { useState, useCallback, useEffect, useRef } from 'react'

interface Coordinates {
  latitude: number
  longitude: number
}

interface GeolocationError {
  code: number
  message: string
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
}

export const useGeolocation = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
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
        if (!isMounted.current) return

        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLoading(false)
      },
      geoError => {
        if (!isMounted.current) return

        setError({
          code: geoError.code,
          message: geoError.message,
        })
        setIsLoading(false)
      },
      GEOLOCATION_OPTIONS
    )
  }, [])

  return { coordinates, error, isLoading, getLocation }
}
