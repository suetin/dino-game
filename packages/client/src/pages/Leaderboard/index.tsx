import { useEffect } from 'react'
import { useDispatch, useSelector } from '@/store'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { selectUser } from '@/slices/userSlice'
import { selectIsDarkMode } from '@/slices/themeSlice'
import {
  selectLeaderboardDataSource,
  fetchLeaderboardThunk,
  resetLeaderboard,
  selectLeaderboardEntries,
  selectLeaderboardError,
  selectLeaderboardLoading,
  selectLeaderboardHasMore,
} from '@/slices/leaderboardSlice'

const PAGE_SIZE = 10

const normalizePlayerName = (value?: string | null) => (value ?? '').trim().toLowerCase()

export const LeaderboardPage = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const isDarkMode = useSelector(selectIsDarkMode)

  const entries = useSelector(selectLeaderboardEntries)
  const isLoading = useSelector(selectLeaderboardLoading)
  const error = useSelector(selectLeaderboardError)
  const hasMore = useSelector(selectLeaderboardHasMore)
  const dataSource = useSelector(selectLeaderboardDataSource)

  const currentPlayerName = normalizePlayerName(
    user?.displayName ||
      [user?.first_name, user?.second_name].filter(Boolean).join(' ').trim() ||
      user?.login ||
      user?.email ||
      user?.userName ||
      'Anonymous'
  )

  useEffect(() => {
    dispatch(resetLeaderboard())
  }, [dispatch])

  useEffect(() => {
    dispatch(resetLeaderboard())
    dispatch(fetchLeaderboardThunk({ cursor: 0, limit: PAGE_SIZE, append: false }))
  }, [dispatch])

  const handleLoadMore = () => {
    if (isLoading || !hasMore) return

    dispatch(
      fetchLeaderboardThunk({
        cursor: entries.length,
        limit: PAGE_SIZE,
        append: true,
      })
    )
  }

  return (
    <WrapperContent className="max-w-[1000px] items-center justify-center">
      <PageMeta title="Leaderboard - Dino Game" description="Таблица лидеров Dino Game" />

      <Card
        className={
          isDarkMode
            ? 'w-full border-slate-700 bg-slate-900 text-slate-100'
            : 'w-full border-zinc-200 bg-white text-zinc-900'
        }>
        <CardHeader>
          <CardTitle className="text-center text-3xl">Таблица лидеров</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {dataSource === 'cache' && (
            <Alert>
              <AlertTitle>Нет сети</AlertTitle>
              <AlertDescription>
                Показана последняя сохраненная версия таблицы лидеров. Данные могут быть
                устаревшими.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && entries.length === 0 && (
            <div className="text-center text-sm text-muted-foreground">Загрузка...</div>
          )}

          {!isLoading && entries.length === 0 && !error && (
            <div className="text-center text-sm text-muted-foreground">
              Таблица лидеров пока пуста
            </div>
          )}

          {entries.length > 0 && (
            <div
              className={
                isDarkMode
                  ? 'overflow-hidden rounded-md border border-slate-700 bg-slate-800'
                  : 'overflow-hidden rounded-md border border-zinc-200 bg-zinc-50'
              }>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow
                      className={
                        isDarkMode
                          ? 'bg-slate-700 hover:bg-slate-700'
                          : 'bg-zinc-100 hover:bg-zinc-100'
                      }>
                      <TableHead className="w-[80px]">#</TableHead>
                      <TableHead>Игрок</TableHead>
                      <TableHead className="w-[120px] text-right">Счёт</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>

                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableBody>
                      {entries.map((entry, index) => {
                        const isCurrentPlayer =
                          normalizePlayerName(entry.data.name) === currentPlayerName

                        const rowNumber = index + 1

                        return (
                          <TableRow
                            key={rowNumber}
                            className={
                              isCurrentPlayer
                                ? isDarkMode
                                  ? 'bg-blue-900/40 font-semibold'
                                  : 'bg-blue-100 font-semibold'
                                : isDarkMode
                                ? 'hover:bg-slate-700/60'
                                : 'hover:bg-zinc-100'
                            }>
                            <TableCell className="w-[80px]">{rowNumber}</TableCell>

                            <TableCell>
                              {entry.data.name}
                              {isCurrentPlayer && <span className="ml-2 text-blue-400">★</span>}
                            </TableCell>

                            <TableCell className="w-[120px] text-right">
                              {entry.data.score}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button type="button" onClick={handleLoadMore} disabled={isLoading}>
                {isLoading ? 'Загрузка...' : 'Показать ещё'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </WrapperContent>
  )
}
