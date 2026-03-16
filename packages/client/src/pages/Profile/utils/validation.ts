export type ProfileFormState = {
  first_name: string
  second_name: string
  phone: string
  email: string
  display_name: string
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>

export function validateProfile(values: ProfileFormState): ProfileFormErrors {
  const e: ProfileFormErrors = {}
  const t = (s: string) => s.trim()
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!t(values.first_name)) e.first_name = 'Имя обязательно'
  else if (t(values.first_name).length < 2) e.first_name = 'Минимум 2 символа'

  if (!t(values.second_name)) e.second_name = 'Фамилия обязательна'
  else if (t(values.second_name).length < 2) e.second_name = 'Минимум 2 символа'

  if (!t(values.display_name)) e.display_name = 'Имя пользователя обязательно'
  else if (t(values.display_name).length < 2) e.display_name = 'Минимум 2 символа'

  if (!t(values.email)) e.email = 'Почта обязательна'
  else if (!emailRe.test(t(values.email))) e.email = 'Некорректная почта'

  if (t(values.phone)) {
    const ok = /^[0-9+()\-\s]{6,20}$/.test(t(values.phone))
    if (!ok) e.phone = 'Некорректный телефон'
  }

  return e
}

export function hasProfileErrors(errors: ProfileFormErrors) {
  return Object.values(errors).some(Boolean)
}
