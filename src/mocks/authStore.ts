import type { AuthResponse } from '../interfaces/session'
import { SCOUT } from './fixtures/session'

interface StoredScout {
  userId: string
  name: string
  email: string
  password: string
}

interface StoreOptions {
  accessTokenUses?: number
}

const ACCESS_TOKEN_MINUTES = 15
const REFRESH_TOKEN_DAYS = 7

const ACCESS_PREFIX = 'mock-access'
const REFRESH_PREFIX = 'mock-refresh'

const state = {
  scouts: new Map<string, StoredScout>(),
  version: 0,
  accessTokenUses: undefined as number | undefined,
  uses: new Map<string, number>(),
  expiredAccessTokens: new Set<string>(),
  usedRefreshTokens: new Set<string>(),
  revokedBefore: new Map<string, number>(),
}

const tokenFor = (prefix: string, version: number, email: string) => `${prefix}:${version}:${email}`

const parseToken = (token: string, prefix: string) => {
  const [tokenPrefix, version, ...email] = token.split(':')
  if (tokenPrefix !== prefix || !version || email.length === 0) return undefined
  return { version: Number(version), email: email.join(':') }
}

const addMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString()

export const resetAuthStore = ({ accessTokenUses }: StoreOptions = {}) => {
  state.scouts = new Map([[SCOUT.email, { ...SCOUT }]])
  state.version = 0
  state.accessTokenUses = accessTokenUses
  state.uses.clear()
  state.expiredAccessTokens.clear()
  state.usedRefreshTokens.clear()
  state.revokedBefore.clear()
}

resetAuthStore()

export const findScout = (email: string) => state.scouts.get(email.trim().toLowerCase())

export const createScout = (name: string, email: string, password: string): StoredScout => {
  const scout = { userId: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), password }
  state.scouts.set(scout.email, scout)
  return scout
}

export const changePassword = (scout: StoredScout, password: string) => {
  scout.password = password
  revokeAll(scout)
}

export const deleteScout = (scout: StoredScout) => {
  state.scouts.delete(scout.email)
}

export const revokeAll = (scout: StoredScout) => {
  state.version += 1
  state.revokedBefore.set(scout.email, state.version)
}

export const issueSession = (scout: StoredScout): AuthResponse => {
  state.version += 1
  return {
    userId: scout.userId,
    name: scout.name,
    email: scout.email,
    accessToken: tokenFor(ACCESS_PREFIX, state.version, scout.email),
    accessTokenExpiresAtUtc: addMinutes(ACCESS_TOKEN_MINUTES),
    refreshToken: tokenFor(REFRESH_PREFIX, state.version, scout.email),
    refreshTokenExpiresAtUtc: addMinutes(REFRESH_TOKEN_DAYS * 24 * 60),
  }
}

export const seedSession = (): AuthResponse => issueSession(state.scouts.get(SCOUT.email) ?? createScout(SCOUT.name, SCOUT.email, SCOUT.password))

export const scoutForAccessToken = (authorization: string | null): StoredScout | undefined => {
  const token = authorization?.replace(/^Bearer /, '')
  if (!token || state.expiredAccessTokens.has(token)) return undefined
  const parsed = parseToken(token, ACCESS_PREFIX)
  if (!parsed) return undefined

  const uses = (state.uses.get(token) ?? 0) + 1
  state.uses.set(token, uses)
  if (state.accessTokenUses !== undefined && uses > state.accessTokenUses) {
    state.expiredAccessTokens.add(token)
    return undefined
  }
  return state.scouts.get(parsed.email)
}

export const redeemRefreshToken = (token: string): StoredScout | undefined => {
  const parsed = parseToken(token, REFRESH_PREFIX)
  if (!parsed || state.usedRefreshTokens.has(token)) return undefined
  if (parsed.version < (state.revokedBefore.get(parsed.email) ?? 0)) return undefined
  state.usedRefreshTokens.add(token)
  return state.scouts.get(parsed.email)
}

export const releaseRefreshToken = (token: string) => {
  state.usedRefreshTokens.add(token)
}

export const expireAccessToken = (token: string) => {
  state.expiredAccessTokens.add(token)
}
