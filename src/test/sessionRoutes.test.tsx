import { act, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SESSION_KEY, readSession } from '../api/session'
import { expireAccessToken, seedSession } from '../mocks/authStore'
import { mePending, refreshRefused, refreshUnavailable, refreshWithoutIdentification } from '../mocks/handlers/auth'
import { server } from '../mocks/server'
import { renderRoute } from './renderRoute'

const METRICS_URL = '/jogadores/1001/metricas?competicao=325&temporada=72034&contexto=Clube'

const expiredAccessSession = () => {
  const session = seedSession()
  expireAccessToken(session.accessToken)
  return session
}

const recordRequests = () => {
  const paths: string[] = []
  server.events.on('request:start', ({ request }) => {
    paths.push(new URL(request.url).pathname)
  })
  return paths
}

afterEach(() => {
  server.events.removeAllListeners()
  vi.unstubAllEnvs()
})

describe('rotas protegidas', () => {
  it('leva quem nao tem sessao para Entrar guardando o destino', async () => {
    // Act
    const { router } = renderRoute(METRICS_URL, { session: 'signed-out' })

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/entrar'))
    expect(router.state.location.search).toEqual({ redirecionar: METRICS_URL })
  })

  it('vai direto para Entrar sem chamar a API quando o refresh token venceu', async () => {
    // Arrange
    const requests = recordRequests()
    const expired = { ...seedSession(), refreshTokenExpiresAtUtc: '2020-01-01T00:00:00Z' }

    // Act
    const { router } = renderRoute('/', { session: expired })

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/entrar'))
    expect(requests).toEqual([])
  })

  it('leva quem ja entrou de Entrar para o inicio', async () => {
    // Act
    const { router } = renderRoute('/entrar')

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('leva quem ja entrou de Criar conta para o inicio', async () => {
    // Act
    const { router } = renderRoute('/criar-conta')

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})

describe('confirmacao da sessao na abertura', () => {
  it('mostra o topo em skeleton e o corpo vazio enquanto o me nao responde', async () => {
    // Arrange
    server.use(mePending)

    // Act
    renderRoute('/')

    // Assert
    expect(await screen.findByRole('banner')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('Buscar jogador')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Olá, Ana.' })).not.toBeInTheDocument()
  })

  it('confirma e mostra o inicio com o primeiro nome', async () => {
    // Act
    renderRoute('/')

    // Assert
    expect(await screen.findByRole('heading', { name: 'Olá, Ana.' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Nome do jogador' })).toBeInTheDocument()
    expect(document.title).toBe('APIFootballScout')
  })

  it('mostra o erro com Tentar de novo quando a renovacao falha por indisponibilidade', async () => {
    // Arrange
    server.use(refreshUnavailable)

    // Act
    const { router } = renderRoute('/', { session: expiredAccessSession() })

    // Assert
    expect(await screen.findByText('Não foi possível concluir agora.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(readSession()).not.toBeNull()
  })
})

describe('renovacao no meio da tela', () => {
  it('renova o access token vencido e mostra as metricas sem mensagem', async () => {
    // Arrange
    const session = expiredAccessSession()

    // Act
    renderRoute(METRICS_URL, { session })

    // Assert
    expect(await screen.findByText('0,35')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(readSession()?.accessToken).not.toBe(session.accessToken)
  })
})

describe('sessao expirada', () => {
  it.each([
    ['usuario.refresh_token_invalido', refreshRefused, 'Sua sessão expirou. Entre novamente.'],
    ['usuario.token_sem_identificacao', refreshWithoutIdentification, 'Sessão inválida. Entre novamente.'],
  ])('volta para Entrar com o aviso quando a renovacao e recusada com %s', async (_code, handler, notice) => {
    // Arrange
    server.use(handler)

    // Act
    const { router } = renderRoute(METRICS_URL, { session: expiredAccessSession() })

    // Assert
    expect(await screen.findByText(notice)).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/entrar')
    expect(router.state.location.search).toMatchObject({ redirecionar: METRICS_URL })
    expect(readSession()).toBeNull()
  })
})

describe('outra aba', () => {
  it('vai para Entrar quando a sessao some em outra aba', async () => {
    // Arrange
    const { router } = renderRoute('/')
    await screen.findByRole('heading', { name: 'Olá, Ana.' })

    // Act
    act(() => {
      localStorage.removeItem(SESSION_KEY)
      window.dispatchEvent(new StorageEvent('storage', { key: SESSION_KEY, newValue: null }))
    })

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/entrar'))
  })
})
