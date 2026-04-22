const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

function findMonorepoRoot(startDir) {
  let dir = path.resolve(startDir)

  for (let i = 0; i < 12; i += 1) {
    if (fs.existsSync(path.join(dir, 'lerna.json'))) {
      return dir
    }

    const parent = path.dirname(dir)
    if (parent === dir) {
      return undefined
    }

    dir = parent
  }

  return undefined
}

if (process.env.LOAD_DOTENV_FILE !== '0') {
  const rootDir = findMonorepoRoot(process.cwd()) || findMonorepoRoot(__dirname)
  const rootEnv = rootDir ? path.join(rootDir, '.env') : null
  const cwdEnv = path.resolve(process.cwd(), '.env')

  if (rootEnv && fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv, override: false })
  }

  if (fs.existsSync(cwdEnv) && cwdEnv !== rootEnv) {
    dotenv.config({ path: cwdEnv, override: true })
  }
}

function parseDatabaseUrl(raw) {
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
  const databaseUrl = (process.env.DATABASE_URL || '').trim()

  if (databaseUrl) {
    return {
      dialect: 'postgres',
      ...parseDatabaseUrl(databaseUrl),
    }
  }

  const host = process.env.POSTGRES_HOST || 'db'
  const port = Number(process.env.POSTGRES_PORT || 5432)

  return {
    dialect: 'postgres',
    host,
    port,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  }
}

module.exports = {
  development: configFromEnv(),
  test: configFromEnv(),
  production: configFromEnv(),
}
