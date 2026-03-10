import './client.d'

export const SERVER_HOST =
  typeof window === 'undefined' ? __INTERNAL_SERVER_URL__ : __EXTERNAL_SERVER_URL__

export const REDIRECT_URI =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
