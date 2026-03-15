import { useEffect } from 'react'
import { useDispatch, useSelector } from '@/store'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { Button } from '@/components/ui/button'
import {
  fetchLeaderboardThunk,
  resetLeaderboard,
  selectLeaderboardCursor,
  selectLeaderboardEntries,
  selectLeaderboardError,
  selectLeaderboardLoading,
  selectLeaderboardTotal,
} from '@/slices/leaderboardSlice'

const PAGE_SIZE = 10

export const LeaderboardPage = () => {
  const dispatch = useDispatch()

  const entries = useSelector(selectLeaderboardEntries)
  const isLoading = useSelector(selectLeaderboardLoading)
  const error = useSelector(selectLeaderboardError)
  const cursor = useSelector(selectLeaderboardCursor)
  const total = useSelector(selectLeaderboardTotal)

  useEffect(() => {
    dispatch(resetLeaderboard())
    dispatch(fetchLeaderboardThunk({ cursor: 0, limit: PAGE_SIZE, append: false }))
  }, [dispatch])

  const hasMore = cursor !== null && entries.length < total

  const handleLoadMore = () => {
    if (cursor === null || isLoading) return
    dispatch(fetchLeaderboardThunk({ cursor, limit: PAGE_SIZE, append: true }))
  }

  return (
    <WrapperContent className="max-w-[800px] items-center justify-center">
      <PageMeta title="Leaderboard - Dino Game" description="Таблица лидеров Dino Game" />

      <div className="w-full rounded-lg border p-6">
        <h1 className="mb-6 text-2xl font-bold text-center">Таблица лидеров</h1>

        {error ? (
          <div className="mb-4 rounded-md border border-red-500 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {isLoading && entries.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">Загрузка...</div>
        ) : null}

        {!isLoading && entries.length === 0 && !error ? (
          <div className="text-center text-sm text-muted-foreground">
            Таблица лидеров пока пуста
          </div>
        ) : null}

        {entries.length > 0 ? (
          <div className="overflow-hidden rounded-md border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 text-sm font-medium">#</th>
                  <th className="px-4 py-3 text-sm font-medium">Игрок</th>
                  <th className="px-4 py-3 text-sm font-medium text-right">Счёт</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm">{entry.data.name}</td>
                    <td className="px-4 py-3 text-sm text-right">{entry.data.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-6 flex justify-center">
          {hasMore ? (
            <Button type="button" onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? 'Загрузка...' : 'Показать ещё'}
            </Button>
          ) : null}
        </div>
      </div>
    </WrapperContent>
  )
}
