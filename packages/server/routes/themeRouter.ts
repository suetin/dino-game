import { Router } from 'express'
import { getTheme, setTheme } from '../contrellers/themeController'

const themeRouter = Router()

themeRouter.get('/', getTheme)
themeRouter.post('/', setTheme)

export default themeRouter
