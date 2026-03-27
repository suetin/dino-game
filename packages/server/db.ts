import { Sequelize } from 'sequelize-typescript'
import { Topic } from './models/Topic'
import { Comment } from './models/Comment'

const {
  DATABASE_URL,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_PORT,
  POSTGRES_HOST,
} = process.env

const databaseUrl = typeof DATABASE_URL === 'string' ? DATABASE_URL.trim() : ''
const hasDatabaseUrl = databaseUrl.length > 0

if (!hasDatabaseUrl && (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_PORT)) {
  throw new Error('Database environment variables are not fully defined')
}

const sequelize = hasDatabaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      models: [Topic, Comment],
      logging: false,
    })
  : new Sequelize({
      dialect: 'postgres',
      host: POSTGRES_HOST || 'localhost',
      port: Number(POSTGRES_PORT),
      username: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
      models: [Topic, Comment],
      logging: false,
    })

export { sequelize }

export const connectDB = async (): Promise<void> => {
  if (hasDatabaseUrl) {
    console.log('[db] Режим подключения: DATABASE_URL')
  } else {
    console.log(
      `[db] Режим подключения: POSTGRES_* host=${
        POSTGRES_HOST || 'localhost'
      } port=${POSTGRES_PORT} db=${POSTGRES_DB}`
    )
  }

  await sequelize.authenticate()
  await sequelize.sync()
}
