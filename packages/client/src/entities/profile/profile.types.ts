export type UserProfile = {
  id: string
  email?: string
  displayName?: string
  name: string
  secondName: string
  phone?: string
  avatarUrl?: string | null
}

export type UpdateUserProfileDto = Pick<
  UserProfile,
  'email' | 'displayName' | 'name' | 'secondName' | 'phone'
>
