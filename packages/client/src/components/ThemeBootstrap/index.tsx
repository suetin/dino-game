import { useEffect } from 'react'
import { useDispatch } from '@/store'
import { initTheme } from '@/slices/themeSlice'

export const ThemeBootstrap = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initTheme())
  }, [dispatch])

  return null
}
