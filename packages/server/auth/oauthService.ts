import { UniqueConstraintError } from 'sequelize'
import { User } from '../models/User'
import { OAuthAccount } from '../models/OAuthAccount'
import { runtimeConfig } from '../config/runtimeConfig'
import { hasUserConflict, normalizeLoginOrEmail, normalizeValue } from './authService'

type YandexTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

type YandexUserInfoResponse = {
  id?: string
  login?: string
  default_email?: string
  default_phone?: {
    id?: number
    number?: string
  }
  emails?: string[]
  first_name?: string
  last_name?: string
  display_name?: string
  default_avatar_id?: string
}

export class OAuthProviderHttpError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

export class OAuthConflictError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class OAuthProfileError extends Error {
  constructor(message: string) {
    super(message)
  }
}

const OAUTH_HTTP_TIMEOUT_MS = runtimeConfig.oauthHttpTimeoutMs
const YANDEX_OAUTH_SCOPES = 'login:info login:email login:avatar login:phone'

export function getYandexOAuthConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.YANDEX_OAUTH_CLIENT_ID?.trim()
  const clientSecret = process.env.YANDEX_OAUTH_CLIENT_SECRET?.trim()

  if (!clientId || !clientSecret) {
    return null
  }

  return { clientId, clientSecret }
}

export function normalizeRedirectUri(uri: string): string | null {
  try {
    const parsed = new URL(uri)
    const normalizedPath = parsed.pathname.replace(/\/+$/, '') || '/'
    parsed.pathname = normalizedPath
    parsed.hash = ''
    return parsed.toString()
  } catch (_error) {
    return null
  }
}

export function getYandexRedirectUriAllowlist(): Set<string> {
  return new Set(
    String(process.env.YANDEX_OAUTH_REDIRECT_URI_ALLOWLIST || '')
      .split(',')
      .map(value => normalizeRedirectUri(value.trim()))
      .filter((value): value is string => Boolean(value))
  )
}

export function buildYandexAuthorizationUrl(params: {
  clientId: string
  redirectUri: string
  state: string
}): string {
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    scope: YANDEX_OAUTH_SCOPES,
    state: params.state,
  })

  return `https://oauth.yandex.ru/authorize?${query.toString()}`
}

async function oauthFetchWithTimeout(url: string, init: RequestInit): Promise<globalThis.Response> {
  const controller = new AbortController()
  const timerId = setTimeout(() => controller.abort(), OAUTH_HTTP_TIMEOUT_MS)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OAuthProviderHttpError(504, 'OAuth provider timeout')
    }

    throw new OAuthProviderHttpError(502, 'OAuth provider is unreachable')
  } finally {
    clearTimeout(timerId)
  }
}

async function exchangeYandexCodeForToken(
  code: string,
  redirectUri: string,
  config: { clientId: string; clientSecret: string }
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
  })

  const response = await oauthFetchWithTimeout('https://oauth.yandex.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
  const payload = (await response.json().catch(() => ({}))) as YandexTokenResponse

  if (!response.ok || !payload.access_token) {
    const reason =
      payload.error_description ||
      payload.error ||
      `Yandex token exchange failed with status ${response.status}`
    throw new OAuthProviderHttpError(response.status, reason)
  }

  return payload.access_token
}

async function fetchYandexUserInfo(accessToken: string): Promise<YandexUserInfoResponse> {
  const response = await oauthFetchWithTimeout('https://login.yandex.ru/info?format=json', {
    method: 'GET',
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
  })
  const payload = (await response.json().catch(() => ({}))) as YandexUserInfoResponse

  if (!response.ok) {
    throw new OAuthProviderHttpError(
      response.status,
      `Failed to fetch Yandex user info: ${response.status}`
    )
  }

  return payload
}

function buildYandexIdentity(userInfo: YandexUserInfoResponse) {
  const subject = String(userInfo.id || '').trim()

  if (!subject) {
    throw new OAuthProfileError('Yandex user id is missing in userinfo response')
  }

  const normalizedLogin = normalizeLoginOrEmail(String(userInfo.login || '').trim())
  if (!normalizedLogin) {
    throw new OAuthProfileError('Yandex login is missing in userinfo response')
  }

  const providerEmail =
    normalizeLoginOrEmail(String(userInfo.default_email || userInfo.emails?.[0] || '').trim()) ||
    null
  if (!providerEmail) {
    throw new OAuthProfileError('Yandex email is missing in userinfo response')
  }

  const firstName = normalizeValue(String(userInfo.first_name || '').trim())
  if (!firstName) {
    throw new OAuthProfileError('Yandex first_name is missing in userinfo response')
  }

  const lastName = normalizeValue(String(userInfo.last_name || '').trim())
  if (!lastName) {
    throw new OAuthProfileError('Yandex last_name is missing in userinfo response')
  }

  const login = `yandex_${normalizedLogin}`
  const email = providerEmail
  const displayName = normalizeValue(String(userInfo.display_name || '').trim()) || null
  const avatarUrl = userInfo.default_avatar_id
    ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`
    : null
  const phone = normalizeValue(String(userInfo.default_phone?.number || '').trim()) || '00000000000'

  return {
    subject,
    login,
    email,
    phone,
    providerLogin: normalizedLogin,
    providerEmail,
    displayName,
    firstName,
    lastName,
    avatarUrl,
  }
}

async function findOrCreateOAuthUserFromYandex(userInfo: YandexUserInfoResponse): Promise<User> {
  const identity = buildYandexIdentity(userInfo)

  const account = await OAuthAccount.findOne({
    where: {
      provider: 'yandex',
      providerSubject: identity.subject,
    },
    include: [User],
  })

  if (account?.user) {
    account.user.first_name = identity.firstName
    account.user.second_name = identity.lastName
    account.user.display_name = identity.displayName
    account.user.avatarUrl = identity.avatarUrl
    await account.user.save()

    account.providerLogin = identity.providerLogin
    account.providerEmail = identity.providerEmail
    account.updatedAt = new Date()
    await account.save()

    return account.user
  }

  if (await hasUserConflict(identity.login, identity.email)) {
    throw new OAuthConflictError('OAuth account conflicts with existing local account')
  }

  try {
    if (!User.sequelize) {
      throw new Error('Sequelize instance is not initialized')
    }

    return await User.sequelize.transaction(async transaction => {
      const user = await User.create(
        {
          first_name: identity.firstName,
          second_name: identity.lastName,
          display_name: identity.displayName,
          login: identity.login,
          email: identity.email,
          phone: identity.phone,
          avatar: null,
          avatarUrl: identity.avatarUrl,
          password_hash: null,
        },
        { transaction }
      )

      const now = new Date()
      await OAuthAccount.create(
        {
          userId: user.id,
          provider: 'yandex',
          providerSubject: identity.subject,
          providerLogin: identity.providerLogin,
          providerEmail: identity.providerEmail,
          createdAt: now,
          updatedAt: now,
        },
        { transaction }
      )

      return user
    })
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new OAuthConflictError('OAuth account conflicts with existing local account')
    }

    throw error
  }
}

export async function authenticateYandexOAuth(params: {
  code: string
  redirectUri: string
}): Promise<User> {
  const oauthConfig = getYandexOAuthConfig()
  if (!oauthConfig) {
    throw new Error('YANDEX_OAUTH_NOT_CONFIGURED')
  }

  const accessToken = await exchangeYandexCodeForToken(params.code, params.redirectUri, oauthConfig)
  const yandexUser = await fetchYandexUserInfo(accessToken)
  return findOrCreateOAuthUserFromYandex(yandexUser)
}
