import React, { useEffect, useState } from 'react'
import { WrapperContent } from '@/components/WrapperContent'
import { PageMeta } from '@/components/PageMeta'
import { useDispatch, useSelector, RootState } from '@/store'
import {
  fetchTopicsThunk,
  fetchCommentsThunk,
  createTopicThunk,
  createCommentThunk,
  selectTopics,
  selectCurrentComments,
  selectForumLoading,
  Topic,
  clearForumError,
} from '@/slices/forumSlice'
import { selectUser } from '@/slices/userSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const ForumPage = () => {
  const dispatch = useDispatch()
  const topics = useSelector(selectTopics)
  const comments = useSelector(selectCurrentComments)
  const isLoading = useSelector(selectForumLoading)
  const user = useSelector(selectUser)
  const serverError = useSelector((state: RootState) => state.forum.error)

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [showCreateTopic, setShowCreateTopic] = useState(false)

  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicDesc, setNewTopicDesc] = useState('')
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    dispatch(fetchTopicsThunk())
  }, [dispatch])

  const handleSelectTopic = (topic: Topic) => {
    dispatch(clearForumError())
    setSelectedTopic(topic)
    dispatch(fetchCommentsThunk(topic.id))
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearForumError())

    if (!user || !newTopicTitle.trim()) return

    const authorId = user.id ? parseInt(user.id, 10) : 1

    const result = await dispatch(
      createTopicThunk({
        title: newTopicTitle,
        description: newTopicDesc,
        author_id: String(authorId),
      })
    )

    if (createTopicThunk.fulfilled.match(result)) {
      setNewTopicTitle('')
      setNewTopicDesc('')
      setShowCreateTopic(false)
    }
  }

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearForumError())

    if (!user || !selectedTopic || !newComment.trim()) return

    const authorId = user.id ? parseInt(user.id, 10) : 1

    await dispatch(
      createCommentThunk({
        content: newComment,
        author_id: String(authorId),
        topic_id: selectedTopic.id,
      })
    )
    setNewComment('')
  }

  return (
    <WrapperContent className="w-full lg:max-w-2xl items-stretch justify-start text-left">
      <PageMeta title="Форум - Dino Game" description="Форум игры" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Форум</h1>
        {!selectedTopic && (
          <Button
            onClick={() => {
              dispatch(clearForumError())
              setShowCreateTopic(!showCreateTopic)
            }}>
            {showCreateTopic ? 'К списку' : 'Создать тему'}
          </Button>
        )}
        {selectedTopic && (
          <Button
            onClick={() => {
              dispatch(clearForumError())
              setSelectedTopic(null)
            }}>
            Назад к списку
          </Button>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Ошибка сервера</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {isLoading && <p className="text-center py-4">Загрузка...</p>}

      {!selectedTopic && !showCreateTopic && (
        <div className="space-y-4">
          {topics.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
              На форуме пока нет тем. Станьте первым!
            </p>
          )}
          {topics.map(topic => (
            <Card
              key={topic.id}
              className="cursor-pointer transition-colors hover:bg-foreground"
              onClick={() => handleSelectTopic(topic)}>
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {showCreateTopic && (
        <Card>
          <CardHeader>
            <CardTitle>Новая тема</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Заголовок</label>
                <Input
                  placeholder="О чем хотите поговорить?"
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Описание</label>
                <Input
                  placeholder="Добавьте подробностей..."
                  value={newTopicDesc}
                  onChange={e => setNewTopicDesc(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Опубликовать
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedTopic && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl text-primary font-bold">{selectedTopic.title}</h2>
            <p className="mt-2 text-lg text-muted-foreground">{selectedTopic.description}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Комментарии</h3>

            <div className="space-y-4">
              {comments.length === 0 && (
                <p className="text-muted-foreground italic">Пока нет комментариев...</p>
              )}
              {comments.map(comment => (
                <div key={comment.id} className="bg-border p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                      Автор ID: {comment.author_id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-base text-primary-foreground">{comment.content}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleCreateComment}
              className="mt-8 space-y-3 bg-primary p-4 rounded-lg border">
              <h4 className="text-sm font-medium">Ваш комментарий</h4>
              <Input
                className="bg-card"
                placeholder="Напишите, что вы думаете..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
              />
              <Button className="bg-accent" type="submit">
                Отправить
              </Button>
            </form>
          </div>
        </div>
      )}
    </WrapperContent>
  )
}
