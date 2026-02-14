import React from 'react'
import { useSelector } from '@/store'
import { fetchUserThunk, selectUser } from '@/slices/userSlice'
import { usePage } from '@/hooks/usePage'
import { PageInitArgs } from '@/routes'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'

export const ProfilePage = () => {
  const user = useSelector(selectUser)

  usePage({ initPage: initProfilePage })

  return (
    <WrapperContent className="max-w-[600px] items-center justify-center text-center">
      <PageMeta title="Профиль - Dino Game" description="Профиль пользователя" />

      <h1 className="text-2xl font-bold mb-4">Профиль игрока</h1>

      {user ? (
        <div>
          <p>Имя: {user.name}</p>
          <p>Фамилия: {user.second_name}</p>
        </div>
      ) : (
        <p>Загрузка...</p>
      )}
    </WrapperContent>
  )
}

export const initProfilePage = async ({ dispatch, state }: PageInitArgs) => {
  if (!selectUser(state)) {
    return dispatch(fetchUserThunk())
  }
}
