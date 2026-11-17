import { describe, expect, it } from 'vitest'
import { fetchClient } from '../api/client'
import { readSession, saveSession } from '../api/session'
import { expireAccessToken, seedSession } from './authStore'

describe('server', () => {
  it('recusa uma chamada sem handler', async () => {
    // Arrange
    saveSession(seedSession())

    // Act
    const call = fetchClient.GET('/api/Shortlist')

    // Assert
    await expect(call).rejects.toThrow(/onUnhandledRequest/)
  })

  it('responde 401 a uma chamada protegida sem token', async () => {
    // Act
    const call = fetchClient.GET('/api/Players/{id}/profile', { params: { path: { id: 1001 } } })

    // Assert
    await expect(call).rejects.toMatchObject({ status: 401 })
  })

  it('renova a sessao do mock quando o access token vence', async () => {
    // Arrange
    saveSession(seedSession())
    const firstToken = readSession()?.accessToken ?? ''
    expireAccessToken(firstToken)

    // Act
    const { data } = await fetchClient.GET('/api/Auth/me')

    // Assert
    expect(data?.email).toBe('ana.ribeiro@exemplo.com')
    expect(readSession()?.accessToken).not.toBe(firstToken)
  })
})
