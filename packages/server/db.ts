import { Sequelize } from 'sequelize-typescript'
import { Topic } from './models/Topic'
import { Comment } from './models/Comment'
import { Reaction } from './models/Reaction'

function parseDatabaseUrl(raw: string) {
  const parsed = new URL(raw)
  const database = parsed.pathname.replace(/^\//, '')
  if (!database) {
    throw new Error('DATABASE_URL must include a database name')
  }
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
  }
}

function configFromEnv() {
  const databaseUrl = process.env.DATABASE_URL?.trim()

  if (databaseUrl) {
    const parsed = parseDatabaseUrl(databaseUrl)
    return { dialect: 'postgres' as const, ...parsed }
  }

  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT } = process.env
  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_PORT) {
    throw new Error(
      'Задайте либо DATABASE_URL, либо полный набор POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT (и при необходимости POSTGRES_HOST).'
    )
  }

  const host = process.env.POSTGRES_HOST || 'localhost'
  const port = Number(POSTGRES_PORT)

  return {
    dialect: 'postgres' as const,
    host,
    port,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
  }
}

export const sequelize = new Sequelize({
  ...configFromEnv(),
  models: [Topic, Comment, Reaction],
  logging: false,
})

export const connectDB = async (): Promise<void> => {
  await sequelize.authenticate()
  await sequelize.sync()
}
