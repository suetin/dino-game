import { useEffect } from 'react'
import { useDispatch } from '@/store'
import { initThemeThunk } from '@/slices/themeSlice'

export const ThemeBootstrap = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initThemeThunk())
  }, [dispatch])

  return null
}
