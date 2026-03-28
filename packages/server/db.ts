import { Sequelize } from 'sequelize-typescript'
import { Topic } from './models/Topic'
import { Comment } from './models/Comment'
import { Reaction } from './models/Reaction'

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT, POSTGRES_HOST } = process.env

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_PORT) {
  throw new Error('Database environment variables are not fully defined')
}

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: POSTGRES_HOST || 'localhost',
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  models: [Topic, Comment, Reaction],
  logging: false,
})

export const connectDB = async (): Promise<void> => {
  await sequelize.authenticate()
  await sequelize.sync()
}
