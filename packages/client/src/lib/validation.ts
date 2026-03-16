const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6
const PHONE_REGEX = /^\+?[0-9]{10,15}$/
const LOGIN_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z0-9_-]{3,20}$/

export function validateRequired(value: string, fieldName: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return `${fieldName} обязателен для заполнения`
  }
  return ''
}

export function validateEmail(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'Email обязателен для заполнения'
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Введите корректный email'
  }
  return ''
}

export function validatePhone(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'Телефон обязателен для заполнения'
  }
  if (!PHONE_REGEX.test(trimmed)) {
    return 'Введите корректный номер телефона'
  }
  return ''
}

export function validateLogin(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'Логин обязателен для заполнения'
  }
  if (trimmed.length < 3 || trimmed.length > 20) {
    return 'Логин должен быть от 3 до 20 символов'
  }
  if (!LOGIN_REGEX.test(trimmed)) {
    return 'Логин должен состоять из латиницы, может содержать цифры, дефис и подчеркивание'
  }
  if (/^\d+$/.test(trimmed)) {
    return 'Логин не может состоять только из цифр'
  }
  return ''
}

export function validatePassword(value: string, minLength = MIN_PASSWORD_LENGTH): string {
  if (!value) {
    return 'Пароль обязателен для заполнения'
  }
  if (value.length < minLength) {
    return `Пароль должен быть не менее ${minLength} символов`
  }
  return ''
}
export function validatePasswordMatch(password: string, repeatPassword: string): string {
  if (repeatPassword !== password) {
    return 'Пароли не совпадают'
  }
  return ''
}

export const validateLogin = (login: string): string | null => {
  const value = login.trim()

  if (!value) {
    return 'Логин обязателен'
  }

  if (value.length < 3 || value.length > 20) {
    return 'Логин должен быть от 3 до 20 символов'
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    return 'Логин может содержать только латиницу, цифры, "-" и "_"'
  }

  if (!/[a-zA-Z]/.test(value)) {
    return 'Логин должен содержать хотя бы одну букву'
  }

  return null
}

export const validatePhone = (phone: string): string | null => {
  const value = phone.trim()

  if (!value) {
    return 'Телефон обязателен'
  }

  if (!/^\+?\d{10,15}$/.test(value)) {
    return 'Телефон должен содержать от 10 до 15 цифр и может начинаться с +'
  }

  return null
}
