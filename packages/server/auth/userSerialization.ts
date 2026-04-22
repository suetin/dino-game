import { User } from '../models/User'

export function toAuthUserResponse(user: User) {
  return {
    id: user.id,
    first_name: user.first_name,
    second_name: user.second_name,
    display_name: user.display_name,
    login: user.login,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    avatarUrl: user.avatarUrl,
  }
}

export function toClientUserResponse(user: User) {
  return {
    ...toAuthUserResponse(user),
    id: String(user.id),
    displayName: user.display_name ?? '',
    userName: user.login,
  }
}
