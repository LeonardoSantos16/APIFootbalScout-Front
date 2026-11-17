import { afterEach, describe, expect, it, vi } from 'vitest'
import { authResponse } from '../mocks/fixtures/session'
import { ApiError } from './client'
import { REFRESH_LOCK, createRefresher, type Lock } from './refresh'
import { clearSession, readSession, saveSession } from './session'

const setup = (requestRefresh = vi.fn(async () => authResponse(2))) => {
  const locks: string[] = []
  const lock: Lock = (name, task) => {
    locks.push(name)
    return task()
  }
  const onSessionEnded = vi.fn()
  const clear = vi.fn(clearSession)
  const refresher = createRefresher({
    readSession,
    saveSession,
    clearSession: clear,
    requestRefresh,
    onSessionEnded,
    lock,
  })
  return { refresher, requestRefresh, onSessionEnded, clear, locks }
}

afterEach(() => localStorage.clear())

describe('createRefresher', () => {
  it('faz uma renovacao so para chamadas simultaneas', async () => {
    // Arrange
    saveSession(authResponse(1))
    const { refresher, requestRefresh } = setup()

    // Act
    const outcomes = await Promise.all([
      refresher.renew('access-1'),
      refresher.renew('access-1'),
      refresher.renew('access-1'),
    ])

    // Assert
    expect(requestRefresh).toHaveBeenCalledOnce()
    expect(requestRefresh).toHaveBeenCalledWith('refresh-1')
    expect(outcomes.map((outcome) => outcome.kind)).toEqual(['renewed', 'renewed', 'renewed'])
    expect(readSession()).toMatchObject({ accessToken: 'access-2', refreshToken: 'refresh-2' })
  })

  it('renova dentro do lock compartilhado entre abas', async () => {
    // Arrange
    saveSession(authResponse(1))
    const { refresher, locks } = setup()

    // Act
    await refresher.renew('access-1')

    // Assert
    expect(locks).toEqual([REFRESH_LOCK])
  })

  it('usa o par que outra aba ja guardou sem chamar a API', async () => {
    // Arrange
    saveSession(authResponse(2))
    const { refresher, requestRefresh } = setup()

    // Act
    const outcome = await refresher.renew('access-1')

    // Assert
    expect(requestRefresh).not.toHaveBeenCalled()
    expect(outcome).toEqual({ kind: 'renewed', session: readSession() })
  })

  it('renova de novo depois que a renovacao anterior terminou', async () => {
    // Arrange
    saveSession(authResponse(1))
    const requestRefresh = vi
      .fn()
      .mockResolvedValueOnce(authResponse(2))
      .mockResolvedValueOnce(authResponse(3))
    const { refresher } = setup(requestRefresh)
    await refresher.renew('access-1')

    // Act
    await refresher.renew('access-2')

    // Assert
    expect(requestRefresh).toHaveBeenCalledTimes(2)
    expect(readSession()).toMatchObject({ accessToken: 'access-3' })
  })

  it.each([
    ['usuario.refresh_token_invalido', 'sessao-expirada'],
    ['usuario.token_sem_identificacao', 'sessao-invalida'],
  ])('encerra a sessao uma vez quando a API recusa com %s', async (code, notice) => {
    // Arrange
    saveSession(authResponse(1))
    const { refresher, onSessionEnded } = setup(vi.fn().mockRejectedValue(new ApiError(401, { code })))

    // Act
    const outcomes = await Promise.all([refresher.renew('access-1'), refresher.renew('access-1')])

    // Assert
    expect(outcomes).toEqual([{ kind: 'refused' }, { kind: 'refused' }])
    expect(readSession()).toBeNull()
    expect(onSessionEnded).toHaveBeenCalledOnce()
    expect(onSessionEnded).toHaveBeenCalledWith(notice)
  })

  it('encerra a sessao sem chamar a API quando nao ha par guardado', async () => {
    // Arrange
    const { refresher, requestRefresh, onSessionEnded } = setup()

    // Act
    const outcome = await refresher.renew('access-1')

    // Assert
    expect(outcome).toEqual({ kind: 'refused' })
    expect(requestRefresh).not.toHaveBeenCalled()
    expect(onSessionEnded).toHaveBeenCalledWith('sessao-expirada')
  })

  it.each([
    ['502', new ApiError(502, { code: 'sofascore.perfil_do_jogador_indisponivel' })],
    ['500', new ApiError(500, {})],
    ['falha de rede', new TypeError('Failed to fetch')],
  ])('mantem a sessao quando a renovacao falha com %s', async (_case, error) => {
    // Arrange
    saveSession(authResponse(1))
    const { refresher, onSessionEnded, clear } = setup(vi.fn().mockRejectedValue(error))

    // Act
    const outcome = await refresher.renew('access-1')

    // Assert
    expect(outcome).toEqual({ kind: 'unavailable', error })
    expect(clear).not.toHaveBeenCalled()
    expect(onSessionEnded).not.toHaveBeenCalled()
    expect(readSession()).toMatchObject({ accessToken: 'access-1' })
  })
})
