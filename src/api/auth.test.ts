import { HttpResponse } from 'msw'
import createFetchClient from 'openapi-fetch'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AuthResponse } from '../interfaces/session'
import { http } from '../mocks/http'
import { problem } from '../mocks/responses'
import { server } from '../mocks/server'
import { authResponse } from '../test/sessionFixtures'
import { createAuthMiddleware } from './auth'
import { ApiError, errorsMiddleware } from './client'
import { createRefresher } from './refresh'
import type { paths } from './schema'
import { clearSession, readSession, saveSession } from './session'

const NOW = new Date('2026-11-17T12:00:00Z')

const setup = (requestRefresh: (token: string) => Promise<AuthResponse> = async () => authResponse(2)) => {
  const onSessionEnded = vi.fn()
  const refreshSpy = vi.fn(requestRefresh)
  const refresher = createRefresher({
    readSession,
    saveSession,
    clearSession,
    requestRefresh: refreshSpy,
    onSessionEnded,
    lock: (_name, task) => task(),
  })
  const client = createFetchClient<paths>({ baseUrl: import.meta.env.VITE_API_URL, fetch: (request) => globalThis.fetch(request) })
  client.use(errorsMiddleware)
  client.use(
    createAuthMiddleware({
      refresher,
      readSession,
      clearSession,
      onSessionEnded,
      now: () => NOW,
    }),
  )
  return { client, onSessionEnded, requestRefresh: refreshSpy }
}

const recordProfileCalls = (respond: (authorization: string | null) => Response) => {
  const authorizations: (string | null)[] = []
  server.use(
    http.get('/api/Players/{id}/profile', ({ request, response }) => {
      const authorization = request.headers.get('Authorization')
      authorizations.push(authorization)
      return response.untyped(respond(authorization))
    }),
  )
  return authorizations
}

const acceptsOnly = (token: string) => (authorization: string | null) =>
  authorization === `Bearer ${token}` ? HttpResponse.json({}) : problem(401)

const getProfile = (client: ReturnType<typeof setup>['client']) =>
  client.GET('/api/Players/{id}/profile', { params: { path: { id: 1001 } } })

afterEach(() => localStorage.clear())

describe('createAuthMiddleware', () => {
  it('envia o access token nas chamadas protegidas', async () => {
    // Arrange
    saveSession(authResponse(1))
    const { client } = setup()
    const authorizations = recordProfileCalls(acceptsOnly('access-1'))

    // Act
    await getProfile(client)

    // Assert
    expect(authorizations).toEqual(['Bearer access-1'])
  })

  it('nao envia token na entrada', async () => {
    // Arrange
    saveSession(authResponse(1))
    const { client } = setup()
    let authorization: string | null = 'nao chamado'
    server.use(
      http.post('/api/Auth/signin', ({ request, response }) => {
        authorization = request.headers.get('Authorization')
        return response(200).json(authResponse(5))
      }),
    )

    // Act
    await client.POST('/api/Auth/signin', { body: { email: 'ana.ribeiro@exemplo.com', password: 'senhaboa123' } })

    // Assert
    expect(authorization).toBeNull()
  })

  it('renova antes de enviar quando o access token ja venceu', async () => {
    // Arrange
    saveSession(authResponse(1, { accessTokenExpiresAtUtc: '2026-11-17T11:00:00Z' }))
    const { client, requestRefresh } = setup()
    const authorizations = recordProfileCalls(acceptsOnly('access-2'))

    // Act
    await getProfile(client)

    // Assert
    expect(requestRefresh).toHaveBeenCalledOnce()
    expect(authorizations).toEqual(['Bearer access-2'])
  })

  it('renova no 401 e repete a chamada uma vez com o token novo', async () => {
    // Arrange
    saveSession(authResponse(1))
    const { client, requestRefresh } = setup()
    const authorizations = recordProfileCalls(acceptsOnly('access-2'))

    // Act
    const { data } = await getProfile(client)

    // Assert
    expect(data).toEqual({})
    expect(requestRefresh).toHaveBeenCalledOnce()
    expect(authorizations).toEqual(['Bearer access-1', 'Bearer access-2'])
  })

  it('repete a chamada com o corpo intacto', async () => {
    // Arrange
    saveSession(authResponse(1))
    const { client } = setup()
    const bodies: unknown[] = []
    server.use(
      http.post('/api/Acompanhamento', async ({ request, response }) => {
        bodies.push(await request.json())
        return request.headers.get('Authorization') === 'Bearer access-2'
          ? response(201).json({ dossieId: 'd-1', abertoEm: '2026-11-17T12:00:00Z', medidaEm: '2026-11-17T12:00:00Z' })
          : response.untyped(problem(401))
      }),
    )
    const body = { jogadorId: 1001, competicaoId: 325, temporadaId: 58766, contexto: 'Clube' as const }

    // Act
    await client.POST('/api/Acompanhamento', { body })

    // Assert
    expect(bodies).toEqual([body, body])
  })

  it('faz uma renovacao so para chamadas simultaneas', async () => {
    // Arrange
    saveSession(authResponse(1))
    const { client, requestRefresh } = setup()
    const authorizations = recordProfileCalls(acceptsOnly('access-2'))

    // Act
    await Promise.all([getProfile(client), getProfile(client)])

    // Assert
    expect(requestRefresh).toHaveBeenCalledOnce()
    expect(authorizations.filter((value) => value === 'Bearer access-2')).toHaveLength(2)
  })

  it('encerra a sessao quando a repeticao tambem responde 401', async () => {
    // Arrange
    saveSession(authResponse(1))
    const { client, onSessionEnded } = setup()
    const authorizations = recordProfileCalls(() => problem(401))

    // Act
    const call = getProfile(client)

    // Assert
    await expect(call).rejects.toMatchObject({ status: 401 })
    expect(authorizations).toHaveLength(2)
    expect(readSession()).toBeNull()
    expect(onSessionEnded).toHaveBeenCalledWith('sessao-expirada')
  })

  it.each([
    ['entrada', '/api/Auth/signin' as const],
    ['troca de senha', '/api/Auth/change-password' as const],
  ])('nao renova o 401 da %s', async (_case, path) => {
    // Arrange
    saveSession(authResponse(1))
    const { client, requestRefresh } = setup()
    server.use(http.post(path, ({ response }) => response.untyped(problem(401, 'usuario.credenciais_invalidas'))))

    // Act
    const call =
      path === '/api/Auth/signin'
        ? client.POST(path, { body: { email: 'ana.ribeiro@exemplo.com', password: 'errada' } })
        : client.POST(path, { body: { currentPassword: 'errada', newPassword: 'novasenha1' } })

    // Assert
    await expect(call).rejects.toMatchObject({ status: 401 })
    expect(requestRefresh).not.toHaveBeenCalled()
    expect(readSession()).toMatchObject({ accessToken: 'access-1' })
  })

  it('deixa o 401 chegar como erro quando a renovacao e recusada', async () => {
    // Arrange
    saveSession(authResponse(1))
    const { client, onSessionEnded } = setup(async () => {
      throw new ApiError(401, { code: 'usuario.refresh_token_invalido' })
    })
    recordProfileCalls(() => problem(401))

    // Act
    const call = getProfile(client)

    // Assert
    await expect(call).rejects.toMatchObject({ status: 401 })
    expect(onSessionEnded).toHaveBeenCalledOnce()
    expect(onSessionEnded).toHaveBeenCalledWith('sessao-expirada')
  })

  it('falha com o erro da renovacao e mantem a sessao quando a API esta fora', async () => {
    // Arrange
    saveSession(authResponse(1))
    const unavailable = new ApiError(502, {})
    const { client, onSessionEnded } = setup(async () => {
      throw unavailable
    })
    recordProfileCalls(() => problem(401))

    // Act
    const call = getProfile(client)

    // Assert
    await expect(call).rejects.toBe(unavailable)
    expect(onSessionEnded).not.toHaveBeenCalled()
    expect(readSession()).toMatchObject({ accessToken: 'access-1' })
  })

  it('nao envia token sem sessao', async () => {
    // Arrange
    const { client } = setup()
    const authorizations = recordProfileCalls(() => HttpResponse.json({}))

    // Act
    await getProfile(client)

    // Assert
    expect(authorizations).toEqual([null])
  })
})
