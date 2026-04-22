import { useSelector } from 'react-redux'
import { selectUser, selectUserLoading } from '@/slices/userSlice'

export const useAuth = () => {
  const user = useSelector(selectUser)
  const isLoading = useSelector(selectUserLoading)

  return {
    isAuth: !!user,
    isLoading,
  }
}
