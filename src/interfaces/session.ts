import type { components } from '../api/schema'

export type AuthResponse = components['schemas']['AuthResponseDto']

export interface Session {
  accessToken: string
  accessTokenExpiresAtUtc: string
  refreshToken: string
  refreshTokenExpiresAtUtc: string
  userId: string
  name: string
  email: string
}

export type SessionNotice = 'sessao-expirada' | 'sessao-invalida' | 'conta-excluida'
