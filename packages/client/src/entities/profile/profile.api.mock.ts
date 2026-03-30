import { User, UserState } from '@/slices/userSlice'

export const LS_KEY = 'dino:user:v1'

export const defaultUser: User = {
  id: '1',
  first_name: 'Dino',
  second_name: 'Player',
  avatarUrl: null,
}

export const initialState: UserState = {
  data: null,
  isLoading: false,
  authError: null,
  error: null,
  serviceId: null,
  updateStatus: 'idle',
  avatarStatus: 'idle',
}
