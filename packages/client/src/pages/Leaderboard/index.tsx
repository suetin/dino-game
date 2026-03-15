import { useEffect, useMemo, useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { selectUser } from '@/slices/userSlice'
import { selectIsDarkMode } from '@/slices/themeSlice'
import {
  fetchLeaderboardThunk,
  resetLeaderboard,
  selectLeaderboardEntries,
  selectLeaderboardError,
  selectLeaderboardLoading,
  selectLeaderboardTotal,
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
  const total = useSelector(selectLeaderboardTotal)

  const [page, setPage] = useState(1)

  const currentPlayerName = normalizePlayerName(
    user?.displayName || user?.name || user?.login || user?.email || 'Anonymous'
  )

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    dispatch(resetLeaderboard())
  }, [dispatch])

  useEffect(() => {
    dispatch(
      fetchLeaderboardThunk({
        cursor: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        append: false,
      })
    )
  }, [dispatch, page])

  const visiblePages = useMemo(() => {
    const pages: number[] = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)

    for (let p = start; p <= end; p += 1) {
      pages.push(p)
    }

    return pages
  }, [page, totalPages])

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
              <Table>
                <TableHeader>
                  <TableRow
                    className={
                      isDarkMode
                        ? 'bg-slate-700 hover:bg-slate-700'
                        : 'bg-zinc-100 hover:bg-zinc-100'
                    }>
                    <TableHead>#</TableHead>
                    <TableHead>Игрок</TableHead>
                    <TableHead className="text-right">Счёт</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {entries.map((entry, index) => {
                    const isCurrentPlayer =
                      normalizePlayerName(entry.data.name) === currentPlayerName

                    const rowNumber = (page - 1) * PAGE_SIZE + index + 1

                    return (
                      <TableRow
                        key={entry.id}
                        className={
                          isCurrentPlayer
                            ? isDarkMode
                              ? 'bg-blue-900/40 font-semibold'
                              : 'bg-blue-100 font-semibold'
                            : isDarkMode
                            ? 'hover:bg-slate-700/60'
                            : 'hover:bg-zinc-100'
                        }>
                        <TableCell>{rowNumber}</TableCell>

                        <TableCell>
                          {entry.data.name}
                          {isCurrentPlayer && <span className="ml-2 text-blue-400">★</span>}
                        </TableCell>

                        <TableCell className="text-right">{entry.data.score}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={page === 1 || isLoading}
                onClick={() => setPage(prev => prev - 1)}>
                Назад
              </Button>

              {visiblePages.map(pageNumber => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? 'default' : 'outline'}
                  disabled={isLoading}
                  onClick={() => setPage(pageNumber)}>
                  {pageNumber}
                </Button>
              ))}

              <Button
                type="button"
                variant="outline"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage(prev => prev + 1)}>
                Вперёд
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </WrapperContent>
  )
}
