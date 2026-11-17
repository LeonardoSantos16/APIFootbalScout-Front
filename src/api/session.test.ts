import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AuthResponse } from '../interfaces/session'
import {
  SESSION_KEY,
  clearSession,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  readSession,
  saveSession,
  subscribe,
} from './session'

const auth: AuthResponse = {
  userId: '6f1c2a10-0000-4000-8000-000000000001',
  name: 'Ana Ribeiro',
  email: 'ana.ribeiro@exemplo.com',
  accessToken: 'access-1',
  accessTokenExpiresAtUtc: '2026-11-17T12:15:00Z',
  refreshToken: 'refresh-1',
  refreshTokenExpiresAtUtc: '2026-11-24T12:00:00Z',
}

afterEach(() => localStorage.clear())

describe('saveSession e readSession', () => {
  it('guarda o par, o nome e o e-mail da resposta de auth', () => {
    // Arrange
    saveSession(auth)

    // Act
    const session = readSession()

    // Assert
    expect(session).toEqual(auth)
  })

  it('substitui o par guardado pelo novo', () => {
    // Arrange
    saveSession(auth)

    // Act
    saveSession({ ...auth, accessToken: 'access-2', refreshToken: 'refresh-2' })

    // Assert
    expect(readSession()).toMatchObject({ accessToken: 'access-2', refreshToken: 'refresh-2' })
  })

  it('devolve a mesma sessao enquanto nada muda', () => {
    // Arrange
    saveSession(auth)

    // Act
    const first = readSession()
    const second = readSession()

    // Assert
    expect(second).toBe(first)
  })

  it('le sem sessao quando nada foi guardado', () => {
    // Act
    const session = readSession()

    // Assert
    expect(session).toBeNull()
  })

  it.each([
    ['texto que nao e JSON', 'abc'],
    ['objeto sem tokens', JSON.stringify({ name: 'Ana Ribeiro' })],
    ['valor que nao e objeto', JSON.stringify(42)],
  ])('le %s como sem sessao', (_case, raw) => {
    // Arrange
    localStorage.setItem(SESSION_KEY, raw)

    // Act
    const session = readSession()

    // Assert
    expect(session).toBeNull()
  })
})

describe('clearSession', () => {
  it('remove a sessao guardada', () => {
    // Arrange
    saveSession(auth)

    // Act
    clearSession()

    // Assert
    expect(readSession()).toBeNull()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })
})

describe('expiracao', () => {
  it.each([
    ['2026-11-17T12:14:59Z', false],
    ['2026-11-17T12:15:00Z', true],
    ['2026-11-17T13:00:00Z', true],
  ])('o access token em %s esta vencido: %s', (now, expected) => {
    // Act
    const expired = isAccessTokenExpired(auth, new Date(now))

    // Assert
    expect(expired).toBe(expected)
  })

  it.each([
    ['2026-11-23T12:00:00Z', false],
    ['2026-11-24T12:00:00Z', true],
  ])('o refresh token em %s esta vencido: %s', (now, expected) => {
    // Act
    const expired = isRefreshTokenExpired(auth, new Date(now))

    // Assert
    expect(expired).toBe(expected)
  })
})

describe('subscribe', () => {
  it('avisa ao guardar e ao limpar ate cancelar', () => {
    // Arrange
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    // Act
    saveSession(auth)
    clearSession()
    unsubscribe()
    saveSession(auth)

    // Assert
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
