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

const BRASILEIRAO_2025 = { competicaoId: 325, temporadaId: 72034, contexto: 'Clube' as const }

const readTracking = (jogadorId: number) =>
  fetchClient.GET('/api/Acompanhamento/{jogadorId}', { params: { path: { jogadorId } } })

const openTracking = (jogadorId: number) =>
  fetchClient.POST('/api/Acompanhamento', { body: { jogadorId, ...BRASILEIRAO_2025 } })

describe('acompanhamento do mock', () => {
  it('le o acompanhamento de um jogador ja acompanhado', async () => {
    // Arrange
    saveSession(seedSession())

    // Act
    const { data } = await readTracking(1001)

    // Assert
    expect(data?.clube.resultado).toBe('ComMudanca')
  })

  it('responde 404 para um jogador nao acompanhado', async () => {
    // Arrange
    saveSession(seedSession())

    // Act
    const call = readTracking(1008)

    // Assert
    await expect(call).rejects.toMatchObject({ status: 404, body: { code: 'acompanhamento.dossie_nao_encontrado' } })
  })

  it('le de volta o acompanhamento recem-aberto', async () => {
    // Arrange
    saveSession(seedSession())
    await openTracking(1008)

    // Act
    const { data } = await readTracking(1008)

    // Assert
    expect(data?.janela.duracaoEmDias).toBe(0)
  })

  it('recusa abrir de novo um jogador ja acompanhado', async () => {
    // Arrange
    saveSession(seedSession())

    // Act
    const call = openTracking(1001)

    // Assert
    await expect(call).rejects.toMatchObject({ status: 409, body: { code: 'acompanhamento.jogador_ja_acompanhado' } })
  })

  it('recusa abrir alem do limite', async () => {
    // Arrange
    saveSession(seedSession())

    // Act
    const call = openTracking(1005)

    // Assert
    await expect(call).rejects.toMatchObject({ status: 422, body: { code: 'acompanhamento.limite_atingido' } })
  })
})
