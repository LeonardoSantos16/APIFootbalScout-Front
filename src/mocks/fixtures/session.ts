import type { AuthResponse } from '../../interfaces/session'

export const SCOUT = {
  userId: '6f1c2a10-0000-4000-8000-000000000001',
  name: 'Ana Ribeiro',
  email: 'ana.ribeiro@exemplo.com',
  password: 'senhaboa123',
}

export const authResponse = (version: number, overrides: Partial<AuthResponse> = {}): AuthResponse => ({
  userId: SCOUT.userId,
  name: SCOUT.name,
  email: SCOUT.email,
  accessToken: `access-${version}`,
  accessTokenExpiresAtUtc: '2099-01-01T00:15:00Z',
  refreshToken: `refresh-${version}`,
  refreshTokenExpiresAtUtc: '2099-01-08T00:00:00Z',
  ...overrides,
})
