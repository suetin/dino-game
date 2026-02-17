import type { ProfileFormState } from './validation'

type UserLike = {
  name?: string | null
  secondName?: string | null
  phone?: string | null
  email?: string | null
  displayName?: string | null
}

export const emptyProfileForm: ProfileFormState = {
  name: '',
  secondName: '',
  phone: '',
  email: '',
  displayName: '',
}

export function mapUserToProfileForm(user: UserLike): ProfileFormState {
  return {
    name: user.name ?? '',
    secondName: user.secondName ?? '',
    phone: user.phone ?? '',
    email: user.email ?? '',
    displayName: user.displayName ?? '',
  }
}
