/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  globals: {
    __SERVER_PORT__: process.env.SERVER_PORT,
    __EXTERNAL_SERVER_URL__: 'http://localhost:3001',
    __INTERNAL_SERVER_URL__: 'http://localhost:3001',
  },
  moduleNameMapper: {
    // Поддержка алиаса @/
    '^@/(.*)$': '<rootDir>/src/$1',
    // Заглушки для стилей и картинок (чтобы тесты не падали)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
}
