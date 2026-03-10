import './client.d'

export const SERVER_HOST = 'https://ya-praktikum.tech/api/v2'

export const SERVER_HOST2 =
  typeof window === 'undefined' ? __INTERNAL_SERVER_URL__ : __EXTERNAL_SERVER_URL__

export const REDIRECT_URI =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
