import { Router } from 'express'
// Импортируем созданный контроллер
import { CommentController } from '../contrellers/commentController'

export const commentRouter = Router()

// Теперь просто связываем путь и метод контроллера
commentRouter.post('/', CommentController.create)
commentRouter.put('/:id', CommentController.update)
commentRouter.delete('/:id', CommentController.delete)
