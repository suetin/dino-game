import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

if (process.env.LOAD_DOTENV_FILE !== '0') {
  const rootEnvPath = path.resolve(__dirname, '../../.env')
  const localEnvPath = path.resolve(process.cwd(), '.env')

  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath })
  }

  if (fs.existsSync(localEnvPath) && localEnvPath !== rootEnvPath) {
    dotenv.config({ path: localEnvPath, override: true })
  }
}
