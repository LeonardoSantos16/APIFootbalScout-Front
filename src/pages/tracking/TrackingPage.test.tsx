import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildProfileWithoutStats } from '../../mocks/fixtures/profiles'
import { openedTrackingResult } from '../../mocks/fixtures/tracking'
import {
  openTrackingPending,
  openTrackingSourceDown,
  trackingPending,
  trackingUnknownError,
} from '../../mocks/handlers/tracking'
import { http } from '../../mocks/http'
import { problem } from '../../mocks/responses'
import { server } from '../../mocks/server'
import { startTracking } from '../../mocks/trackingStore'
import { renderRoute } from '../../test/renderRoute'

const BRASILEIRAO_2025 = 'competicao=325&temporada=72034&contexto=Clube'
const COPA_DO_BRASIL_LABEL = 'Clube · Copa do Brasil · 2025'
const tab = (playerId: number, search = BRASILEIRAO_2025) => `/jogadores/${playerId}/acompanhamento?${search}`

const OPENING = '/api/Acompanhamento'

const requests = (fragment: string, method = 'GET') => {
  const urls: URL[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (request.method === method && url.pathname.includes(fragment)) urls.push(url)
  })
  return urls
}

const readings = () => requests('/api/Acompanhamento/')
const openings = () => requests('/api/Acompanhamento', 'POST')

const measurement = (title: string) => screen.getByRole('article', { name: title })

const findTrackButton = () => screen.findByRole('button', { name: 'Acompanhar' })

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-18T23:40:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  server.events.removeAllListeners()
})

describe('aba Acompanhamento', () => {
  it('abre com a aba selecionada sem pedir o perfil de novo', async () => {
    // Arrange
    const profiles = requests('/profile')

    // Act
    renderRoute(tab(1001))

    // Assert
    const link = await screen.findByRole('link', { name: 'Acompanhamento' })
    expect(link).toHaveAttribute('aria-current', 'page')
    await screen.findByText('Linha de base de 22/10/2026 · comparando os últimos 27 dias')
    expect(profiles).toHaveLength(1)
  })

  it('poe o nome do jogador no titulo da aba do navegador', async () => {
    // Act
    renderRoute(tab(1001))

    // Assert
    await waitFor(() => expect(document.title).toBe('Acompanhamento · Rafael Montes · APIFootballScout'))
  })

  it('mostra o esqueleto enquanto a leitura nao chega', async () => {
    // Arrange
    server.use(trackingPending)

    // Act
    renderRoute(tab(1001))

    // Assert
    expect(await screen.findByRole('status', { name: 'Carregando acompanhamento' })).toBeInTheDocument()
    expect(screen.queryByText('Vila Nova Paulista')).not.toBeInTheDocument()
  })
})

describe('jogador acompanhado', () => {
  it('mostra a janela e as tres afericoes com mudanca, sem o seletor de recorte', async () => {
    // Act
    renderRoute(tab(1001))

    // Assert
    await screen.findByText('Linha de base de 22/10/2026 · comparando os últimos 27 dias')
    expect(measurement('Clube')).toHaveTextContent('Vila Nova Paulista → Atlético Serrano')
    expect(measurement('Valor de mercado')).toHaveTextContent('€8M → €9,6M')
    expect(within(measurement('Valor de mercado')).getByText('+20,0% alta')).toBeInTheDocument()
    expect(measurement('Minutagem')).toHaveTextContent('820 → 1.240 min')
    expect(within(measurement('Minutagem')).getByText('+420 min a mais')).toBeInTheDocument()
    expect(screen.queryByLabelText('Competição e temporada')).not.toBeInTheDocument()
  })

  it('mostra o valor atual quando nao ha mudanca relevante', async () => {
    // Act
    renderRoute(tab(1002, 'competicao=295&temporada=72034&contexto=Selecao'))

    // Assert
    await screen.findByText('Linha de base de 17/11/2026 · comparando o último dia')
    expect(measurement('Clube')).toHaveTextContent('Atlético Serrano')
    expect(measurement('Valor de mercado')).toHaveTextContent('€4,5M')
    expect(measurement('Minutagem')).toHaveTextContent('1.410 min')
    expect(screen.getAllByText('Sem mudança relevante')).toHaveLength(3)
  })

  it('explica as afericoes indisponiveis mesmo sem recortes no perfil', async () => {
    // Act
    renderRoute('/jogadores/1003/acompanhamento')

    // Assert
    await screen.findByText('Linha de base de 03/08/2026 · comparando os últimos 107 dias')
    expect(measurement('Clube')).toHaveTextContent('Porto Litoral → Atlético Serrano')
    expect(measurement('Valor de mercado')).toHaveTextContent(
      'A fonte passou a publicar o valor em outra moeda; comparar seria enganoso.',
    )
    expect(measurement('Minutagem')).toHaveTextContent(
      'A temporada virou e a minutagem zerou. A leitura antiga não é comparável.',
    )
    expect(screen.queryByText('Sem mudança relevante')).not.toBeInTheDocument()
    expect(screen.queryByText('Sem estatísticas publicadas para este jogador.')).not.toBeInTheDocument()
  })

  it('ignora outro recorte na URL', async () => {
    // Act
    renderRoute(tab(1001, 'competicao=373&temporada=72034&contexto=Clube'))

    // Assert
    expect(await screen.findByText('Linha de base de 22/10/2026 · comparando os últimos 27 dias')).toBeInTheDocument()
    expect(measurement('Valor de mercado')).toHaveTextContent('€8M → €9,6M')
    expect(screen.queryByLabelText('Competição e temporada')).not.toBeInTheDocument()
  })
})

describe('jogador nao acompanhado', () => {
  it('oferece acompanhar no recorte da URL', async () => {
    // Act
    renderRoute(tab(1008))

    // Assert
    expect(await screen.findByText('Você não acompanha este jogador.')).toBeInTheDocument()
    expect(
      screen.getByText('Ao acompanhar, o clube, o valor de mercado e a minutagem de hoje viram a linha de base.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Competição e temporada')).toHaveDisplayValue('Clube · Brasileirão Série A · 2025')
    expect(await findTrackButton()).toBeEnabled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('troca o recorte na URL sem ler o acompanhamento de novo', async () => {
    // Arrange
    const calls = readings()
    const { router } = renderRoute(tab(1008))
    await findTrackButton()

    // Act
    await userEvent.selectOptions(screen.getByLabelText('Competição e temporada'), COPA_DO_BRASIL_LABEL)

    // Assert
    await waitFor(() => expect(router.state.location.search).toMatchObject({ competicao: 373 }))
    expect(calls).toHaveLength(1)
  })

  it('mostra o estado sem estatisticas sem o botao de acompanhar', async () => {
    // Arrange
    server.use(
      http.get('/api/Players/{id}/profile', ({ response }) => response(200).json(buildProfileWithoutStats(1008))),
    )

    // Act
    renderRoute('/jogadores/1008/acompanhamento')

    // Assert
    expect(await screen.findByText('Sem estatísticas publicadas para este jogador.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Acompanhar' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Competição e temporada')).not.toBeInTheDocument()
  })
})

describe('acompanhar', () => {
  it('abre o acompanhamento no recorte escolhido e mostra o painel', async () => {
    // Arrange
    const bodies: unknown[] = []
    server.use(
      http.post(OPENING, async ({ request, response }) => {
        const body = await request.json()
        bodies.push(body)
        startTracking(body.jogadorId ?? 0)
        return response(201).json(openedTrackingResult())
      }),
    )
    renderRoute(tab(1008))

    // Act
    await userEvent.click(await findTrackButton())

    // Assert
    expect(await screen.findByText('Linha de base medida hoje')).toBeInTheDocument()
    expect(bodies).toEqual([{ jogadorId: 1008, competicaoId: 325, temporadaId: 72034, contexto: 'Clube' }])
    expect(screen.queryByRole('button', { name: 'Acompanhar' })).not.toBeInTheDocument()
  })

  it('trava o seletor e o botao enquanto abre', async () => {
    // Arrange
    server.use(openTrackingPending)
    renderRoute(tab(1008))

    // Act
    await userEvent.click(await findTrackButton())

    // Assert
    expect(await screen.findByRole('button', { name: 'Acompanhando…' })).toBeDisabled()
    expect(screen.getByLabelText('Competição e temporada')).toBeDisabled()
  })

  it('le de novo sem mensagem quando o jogador ja era acompanhado em outra aba', async () => {
    // Arrange
    server.use(
      http.post(OPENING, ({ response }) => {
        startTracking(1008)
        return response.untyped(problem(409, 'acompanhamento.jogador_ja_acompanhado'))
      }),
    )
    renderRoute(tab(1008))

    // Act
    await userEvent.click(await findTrackButton())

    // Assert
    expect(await screen.findByText('Linha de base medida hoje')).toBeInTheDocument()
    expect(screen.queryByText('Você já acompanha este jogador.')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('avisa o limite abaixo do botao, que continua habilitado', async () => {
    // Arrange
    renderRoute(tab(1005))

    // Act
    await userEvent.click(await findTrackButton())

    // Assert
    expect(await screen.findByText('Limite de 10 acompanhamentos atingido.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acompanhar' })).toBeEnabled()
    expect(screen.queryByText(/Encerre/)).not.toBeInTheDocument()
  })

  it('avisa o jogador sem base comparavel', async () => {
    // Arrange
    renderRoute(tab(1006, 'competicao=325&temporada=87678&contexto=Clube'))

    // Act
    await userEvent.click(await findTrackButton())

    // Assert
    expect(
      await screen.findByText('O jogador não tem dados suficientes para servir de linha de base.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acompanhar' })).toBeEnabled()
  })

  it('oferece nova tentativa no lugar do botao com a fonte fora', async () => {
    // Arrange
    server.use(openTrackingSourceDown)
    const calls = openings()
    renderRoute(tab(1008))
    await userEvent.click(await findTrackButton())
    const retry = await screen.findByRole('button', { name: 'Tentar de novo' })
    expect(screen.getByText('Não foi possível acompanhar agora.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Acompanhar' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Competição e temporada')).toBeInTheDocument()

    // Act
    await userEvent.click(retry)

    // Assert
    await waitFor(() => expect(calls).toHaveLength(2))
  })
})

describe('falhas da leitura', () => {
  it('oferece nova tentativa com a fonte fora', async () => {
    // Arrange
    const calls = readings()
    renderRoute(tab(1007))
    const retry = await screen.findByRole('button', { name: 'Tentar de novo' })
    expect(screen.getByText('Não foi possível ler o acompanhamento agora.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Acompanhamento' })).toBeInTheDocument()

    // Act
    await userEvent.click(retry)

    // Assert
    await waitFor(() => expect(calls.length).toBeGreaterThan(2))
  })

  it('mostra o erro generico sem code', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(trackingUnknownError)

    // Act
    renderRoute(tab(1001))

    // Assert
    expect(await screen.findByText('Não foi possível concluir agora.')).toBeInTheDocument()
  })
})

describe('troca de aba', () => {
  it('reaproveita a leitura ao voltar das metricas', async () => {
    // Arrange
    const calls = readings()
    renderRoute(tab(1001))
    await screen.findByText('Linha de base de 22/10/2026 · comparando os últimos 27 dias')

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Métricas' }))
    await screen.findByText('0,35')
    await userEvent.click(screen.getByRole('link', { name: 'Acompanhamento' }))

    // Assert
    expect(await screen.findByText('Linha de base de 22/10/2026 · comparando os últimos 27 dias')).toBeInTheDocument()
    expect(calls).toHaveLength(1)
  })

  it('mantem o recorte e o segundo jogador ao passar pelo acompanhamento', async () => {
    // Arrange
    const { router } = renderRoute(`${tab(1001)}&com=1006`)
    await screen.findByText('Linha de base de 22/10/2026 · comparando os últimos 27 dias')

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Comparação' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/comparacao'))
    expect(router.state.location.search).toEqual({ competicao: 325, temporada: 72034, contexto: 'Clube', com: 1006 })
  })

  it('abre o acompanhamento a partir do perfil', async () => {
    // Arrange
    const { router } = renderRoute('/jogadores/1001')

    // Act
    await userEvent.click(await screen.findByRole('link', { name: 'Acompanhamento' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/acompanhamento'))
    expect(await screen.findByRole('link', { name: 'Acompanhamento' })).toHaveAttribute('aria-current', 'page')
  })
})
