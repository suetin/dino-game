const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6
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
