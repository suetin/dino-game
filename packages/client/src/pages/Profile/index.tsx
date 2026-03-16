import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from '@/store'
import { fetchUserThunk, selectUser, selectUserError } from '@/slices/userSlice'
import { usePage } from '@/hooks/usePage'
import { PageInitArgs } from '@/routes'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { Button } from '@/components/ui/button'
import {
  updateUserThunk,
  uploadAvatarThunk,
  deleteAvatarThunk,
  selectUserLoading,
  selectUserUpdateStatus,
  selectUserAvatarStatus,
} from '@/slices/userSlice'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  hasProfileErrors,
  ProfileFormErrors,
  ProfileFormState,
  validateProfile,
} from '@/pages/Profile/utils/validation'
import { DefaultAvatarIcon } from '@/pages/Profile/ui/DefaultAvatarIcon'
import { emptyProfileForm, mapUserToProfileForm } from '@/pages/Profile/utils/mappers'
import { validateAvatarFile } from '@/pages/Profile/utils/avatar.utils'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  const loading = useSelector(selectUserLoading)
  const updateStatus = useSelector(selectUserUpdateStatus)
  const avatarStatus = useSelector(selectUserAvatarStatus)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  usePage({ initPage: initProfilePage })

  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState<ProfileFormState>(emptyProfileForm)
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setForm(mapUserToProfileForm(user))
    setErrors({})
  }, [user])

  useEffect(() => {
    if (updateStatus === 'success') {
      setSuccessMsg('Профиль сохранён')
      const t = window.setTimeout(() => setSuccessMsg(null), 2500)
      return () => window.clearTimeout(t)
    }
    if (avatarStatus === 'success') {
      setSuccessMsg('Аватар обновлён')
      const t = window.setTimeout(() => setSuccessMsg(null), 2500)
      return () => window.clearTimeout(t)
    }
  }, [updateStatus, avatarStatus])

  const saving = updateStatus === 'pending'
  const avatarBusy = avatarStatus === 'pending'

  const canSave = useMemo(
    () => isEdit && !saving && !avatarBusy && !hasProfileErrors(errors),
    [isEdit, saving, avatarBusy, errors]
  )

  const setField = (key: keyof ProfileFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const onBlurField = (key: keyof ProfileFormState) => {
    const next = validateProfile(form)
    setErrors(prev => ({ ...prev, [key]: next[key] }))
  }

  const onStartEdit = () => {
    if (!user) return
    setIsEdit(true)
    setSuccessMsg(null)
    setErrors({})
  }

  const onCancel = () => {
    if (!user) return
    setIsEdit(false)
    setForm(mapUserToProfileForm(user))
    setErrors({})
    setSuccessMsg(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)

    const nextErrors = validateProfile(form)
    setErrors(nextErrors)
    if (hasProfileErrors(nextErrors)) return

    if (!user) return

    await dispatch(updateUserThunk(mapUserToProfileForm(user)))

    setIsEdit(false)
  }

  const onPickAvatar = async (file: File | null) => {
    setSuccessMsg(null)
    if (!file) return

    const v = validateAvatarFile(file)
    if (!v.ok) {
      return
    }

    await dispatch(uploadAvatarThunk(file))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onDeleteAvatar = async () => {
    setSuccessMsg(null)
    await dispatch(deleteAvatarThunk())
  }

  const error = useSelector(selectUserError)

  const onChangeField = (key: keyof ProfileFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setField(key, e.target.value)

  const onBlurFieldHandler = (key: keyof ProfileFormState) => () => onBlurField(key)

  return (
    <WrapperContent className="max-w-[600px] items-center justify-center text-center">
      <PageMeta title="Профиль - Dino Game" description="Страница профиля пользователя" />

      {loading && !user && <p>Загрузка...</p>}
      {user && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1>Профиль пользователя</h1>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Ошибка</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMsg && (
                <Alert className="border-green-500 text-green-600">
                  <AlertTitle>Успешно</AlertTitle>
                  <AlertDescription>{successMsg}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => onPickAvatar(e.target.files?.[0] ?? null)}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (!isEdit || avatarBusy) return
                    fileInputRef.current?.click()
                  }}
                  disabled={!isEdit || avatarBusy}
                  className="inline-flex items-center justify-center rounded-full disabled:cursor-not-allowed"
                  aria-label={isEdit ? 'Загрузить/изменить аватар' : 'Аватар'}
                  title={isEdit ? 'Нажмите, чтобы загрузить/изменить аватар' : undefined}>
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatarUrl ?? ''} alt="avatar" />
                    <AvatarFallback>
                      <DefaultAvatarIcon />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isEdit ? (
                  <div className="text-xs text-muted-foreground">
                    Нажмите на аватар, чтобы загрузить изображение
                  </div>
                ) : null}
              </div>
              {isEdit ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onDeleteAvatar}
                  disabled={avatarBusy || !user.avatarUrl}>
                  {avatarBusy ? '...' : 'Удалить аватар'}
                </Button>
              ) : null}
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="firstName">Имя</FieldLabel>
                  <Input
                    id="firstName"
                    type="text"
                    value={isEdit ? form.name : user.name ?? ''}
                    onChange={isEdit ? onChangeField('name') : undefined}
                    onBlur={isEdit ? onBlurFieldHandler('name') : undefined}
                    readOnly={!isEdit || saving}
                    aria-invalid={!!errors.name}
                  />
                  {isEdit && errors.name ? <FieldError>{errors.name}</FieldError> : null}
                </Field>

                <Field>
                  <FieldLabel htmlFor="secondName">Фамилия</FieldLabel>
                  <Input
                    id="secondName"
                    type="text"
                    value={isEdit ? form.secondName : user.secondName ?? ''}
                    onChange={isEdit ? onChangeField('secondName') : undefined}
                    onBlur={isEdit ? onBlurFieldHandler('secondName') : undefined}
                    readOnly={!isEdit || saving}
                    aria-invalid={!!errors.secondName}
                  />
                  {isEdit && errors.secondName ? (
                    <FieldError>{errors.secondName}</FieldError>
                  ) : null}
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Телефон</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={isEdit ? form.phone : user.phone ?? ''}
                    onChange={isEdit ? onChangeField('phone') : undefined}
                    onBlur={isEdit ? onBlurFieldHandler('phone') : undefined}
                    readOnly={!isEdit || saving}
                    aria-invalid={!!errors.phone}
                  />
                  {isEdit && errors.phone ? <FieldError>{errors.phone}</FieldError> : null}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Почта</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={isEdit ? form.email : user.email ?? ''}
                    onChange={isEdit ? onChangeField('email') : undefined}
                    onBlur={isEdit ? onBlurFieldHandler('email') : undefined}
                    readOnly={!isEdit || saving}
                    aria-invalid={!!errors.email}
                  />
                  {isEdit && errors.email ? <FieldError>{errors.email}</FieldError> : null}
                </Field>

                <Field>
                  <FieldLabel htmlFor="displayName">Имя пользователя</FieldLabel>
                  <Input
                    id="displayName"
                    type="text"
                    value={isEdit ? form.displayName : user.displayName ?? ''}
                    onChange={isEdit ? onChangeField('displayName') : undefined}
                    onBlur={isEdit ? onBlurFieldHandler('displayName') : undefined}
                    readOnly={!isEdit || saving}
                    aria-invalid={!!errors.displayName}
                  />
                  {isEdit && errors.displayName ? (
                    <FieldError>{errors.displayName}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {!isEdit ? (
                <Button type="button" onClick={onStartEdit}>
                  Редактировать
                </Button>
              ) : (
                <div className="flex w-full gap-2">
                  <Button type="submit" disabled={!canSave}>
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={saving || avatarBusy}>
                    Отменить
                  </Button>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      )}
    </WrapperContent>
  )
}
export default ProfilePage

export const initProfilePage = async ({ dispatch, state }: PageInitArgs) => {
  if (!selectUser(state)) {
    return dispatch(fetchUserThunk())
  }
}
