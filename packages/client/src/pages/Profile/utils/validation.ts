export type ProfileFormState = {
  name: string
  secondName: string
  phone: string
  email: string
  displayName: string
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>

export function validateProfile(values: ProfileFormState): ProfileFormErrors {
  const e: ProfileFormErrors = {}
  const t = (s: string) => s.trim()
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!t(values.name)) e.name = 'Имя обязательно'
  else if (t(values.name).length < 2) e.name = 'Минимум 2 символа'

  if (!t(values.secondName)) e.secondName = 'Фамилия обязательна'
  else if (t(values.secondName).length < 2) e.secondName = 'Минимум 2 символа'

  if (!t(values.displayName)) e.displayName = 'Имя пользователя обязательно'
  else if (t(values.displayName).length < 2) e.displayName = 'Минимум 2 символа'

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
