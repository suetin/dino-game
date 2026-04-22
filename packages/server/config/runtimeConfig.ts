function readIntEnv(name: string, defaultValue: number): number {
  const raw = process.env[name]?.trim()
  if (!raw) {
    return defaultValue
  }

  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    return defaultValue
  }

  return parsed
}

function readStringEnv(name: string, defaultValue: string): string {
  const raw = process.env[name]?.trim()
  return raw || defaultValue
}

function readCorsAllowlist(): Set<string> {
  const items = String(process.env.AUTH_CORS_ORIGIN_ALLOWLIST || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)

  return new Set(items)
}

export const runtimeConfig = {
  serverPort: readIntEnv('SERVER_PORT', 3001),
  sessionCookieName: readStringEnv('AUTH_SESSION_COOKIE', 'dino_session'),
  bcryptSaltRounds: readIntEnv('BCRYPT_SALT_ROUNDS', 10),
  oauthHttpTimeoutMs: readIntEnv('OAUTH_HTTP_TIMEOUT_MS', 5000),
  oauthStateTtlSec: readIntEnv('OAUTH_STATE_TTL_SEC', 300),
  corsAllowlist: readCorsAllowlist(),
} as const
