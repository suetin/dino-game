import type { ProfileFormState } from './validation'

type UserLike = {
  first_name?: string | null
  second_name?: string | null
  phone?: string | null
  email?: string | null
  display_name?: string | null
  displayName?: string | null
}

export const emptyProfileForm: ProfileFormState = {
  first_name: '',
  second_name: '',
  phone: '',
  email: '',
  display_name: '',
}

export function mapUserToProfileForm(user: UserLike): ProfileFormState {
  return {
    first_name: user.first_name ?? '',
    second_name: user.second_name ?? '',
    phone: user.phone ?? '',
    email: user.email ?? '',
    display_name: user.display_name ?? user.displayName ?? '',
  }
}
