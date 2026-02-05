import { Sequelize } from 'sequelize-typescript'
import { Topic } from './models/Topic'
import { Comment } from './models/Comment'

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_PORT,
  POSTGRES_HOST,
} = process.env

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: POSTGRES_HOST || 'localhost',
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  models: [Topic, Comment],
})

export const createClientAndConnect = async (): Promise<void> => {
  try {
    // Проверяем соединение
    await sequelize.authenticate()
    // Синхронизируем схемы (alter: true обновит таблицы без их удаления)
    await sequelize.sync({ alter: true })

    console.log('  ➜ 🎸 Connected to the database via Sequelize')
  } catch (e) {
    console.error('❌ Database connection error:', e)
    throw e // Пробрасываем ошибку, чтобы сервер не стартовал на "битой" базе
  }
}
