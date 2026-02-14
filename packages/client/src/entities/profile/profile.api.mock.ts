import { User, UserState } from '@/slices/userSlice'

export const LS_KEY = 'dino:user:v1'

export const defaultUser: User = {
  id: '1',
  name: 'Dino',
  secondName: 'Player',
  avatarUrl: null,
}

export const initialState: UserState = {
  data: null,
  isLoading: false,
  error: null,
  updateStatus: 'idle',
  avatarStatus: 'idle',
}
