export const MAX_AVATAR_MB = 5

export function validateAvatarFile(file: File) {
  if (!file.type.startsWith('image/')) {
    return { ok: false as const, error: 'Можно загрузить только изображение' }
  }

  if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
    return { ok: false as const, error: `Файл слишком большой (макс ${MAX_AVATAR_MB}MB)` }
  }

  return { ok: true as const }
}
