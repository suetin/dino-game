const fs = require('fs')

if (!fs.existsSync('.env')) {
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env')
  } else if (fs.existsSync('.env.sample')) {
    fs.copyFileSync('.env.sample', '.env')
  }
}

fs.mkdirSync('tmp/pgdata', { recursive: true })
