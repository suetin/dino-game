import { Sequelize } from 'sequelize-typescript'
import { Topic } from './models/Topic'
import { Comment } from './models/Comment'

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT } =
  process.env

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  models: [Topic, Comment], // Регистрируем созданные модели
})

export const createClientAndConnect = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true }) // Создаст таблицы автоматически
    console.log('  ➜ 🎸 Connected to the database via Sequelize')
  } catch (e) {
    console.error('Connection error:', e)
  }
}
