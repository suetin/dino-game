const fs = require('fs')

if (!fs.existsSync('.env')) {
  fs.copyFileSync('.env.example', '.env')
}

fs.mkdirSync('tmp/pgdata', { recursive: true })
