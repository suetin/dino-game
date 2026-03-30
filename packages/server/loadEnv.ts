import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

function findMonorepoRoot(startDir: string): string | undefined {
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
  const rootDir = findMonorepoRoot(process.cwd()) ?? findMonorepoRoot(__dirname)
  const rootEnv = rootDir ? path.join(rootDir, '.env') : null
  const cwdEnv = path.resolve(process.cwd(), '.env')

  if (rootEnv && fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv, override: false })
  }
  if (fs.existsSync(cwdEnv) && cwdEnv !== rootEnv) {
    dotenv.config({ path: cwdEnv, override: true })
  }
}
