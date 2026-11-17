import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, delay } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calculatedAttributes, metricsResponse } from '../../mocks/fixtures/metrics'
import { incompleteMetrics, metricsWithoutCode } from '../../mocks/handlers/metrics'
import { profileSourceDown } from '../../mocks/handlers/profile'
import { http } from '../../mocks/http'
import { problem } from '../../mocks/responses'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const PROFILE = '/api/Players/{id}/profile'
const METRICS = '/api/Analise/{jogadorId}/metricas-por-90'

const BRASILEIRAO_2025 = '?competicao=325&temporada=72034&contexto=Clube'
const ELIMINATORIAS_2025 = '?competicao=295&temporada=72034&contexto=Selecao'
const COPA_DO_BRASIL_2025 = '?competicao=373&temporada=72034&contexto=Clube'

const metricsRequests = () => {
  const urls: URL[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (url.pathname.includes('metricas-por-90')) urls.push(url)
  })
  return urls
}

const pendingForever = () =>
  http.get(METRICS, async ({ response }) => {
    await delay('infinite')
    return response(200).json(metricsResponse(calculatedAttributes))
  })

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-17T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  server.events.removeAllListeners()
})

describe('abertura da tela', () => {
  it('corrige a URL sem recorte para o primeiro da ordem, sem criar entrada no historico', async () => {
    // Act
    const { router } = renderRoute('/jogadores/1001/metricas')

    // Assert
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ competicao: 325, temporada: 72034, contexto: 'Clube' }),
    )
    expect(router.history.length).toBe(1)
    expect(await screen.findByText('0,35')).toBeInTheDocument()
  })

  it('corrige um recorte que nao existe no perfil', async () => {
    // Act
    const { router } = renderRoute('/jogadores/1001/metricas?competicao=17&temporada=61627&contexto=Clube')

    // Assert
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ competicao: 325, temporada: 72034, contexto: 'Clube' }),
    )
    expect(router.history.length).toBe(1)
  })

  it('corrige um parametro malformado', async () => {
    // Act
    const { router } = renderRoute('/jogadores/1001/metricas?competicao=abc&temporada=72034&contexto=foo')

    // Assert
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ competicao: 325, temporada: 72034, contexto: 'Clube' }),
    )
  })

  it('mantem o recorte valido da URL e pede as metricas dele', async () => {
    // Arrange
    const requests = metricsRequests()

    // Act
    renderRoute(`/jogadores/1001/metricas${ELIMINATORIAS_2025}`)

    // Assert
    const select = await screen.findByRole('combobox', { name: 'Competição e temporada' })
    expect(within(select).getByRole('option', { selected: true })).toHaveTextContent(
      'Seleção · Eliminatórias Sul-Americanas · 2025',
    )
    await waitFor(() => expect(requests).toHaveLength(1))
    expect(Object.fromEntries(requests[0].searchParams)).toEqual({
      CompeticaoId: '295',
      TemporadaId: '72034',
      Contexto: 'Selecao',
    })
  })

  it('ordena as opcoes e poe o contexto quando ha recorte de selecao', async () => {
    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    const select = await screen.findByRole('combobox', { name: 'Competição e temporada' })
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Clube · Brasileirão Série A · 2025',
      'Seleção · Eliminatórias Sul-Americanas · 2025',
      'Clube · Copa do Brasil · 2025',
      'Clube · Brasileirão Série A · 2024',
    ])
  })

  it('mostra blocos no lugar do cabecalho, do seletor e dos valores enquanto o perfil carrega', async () => {
    // Arrange
    server.use(
      http.get(PROFILE, async ({ response }) => {
        await delay('infinite')
        return response.untyped(HttpResponse.json({}))
      }),
    )

    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    expect(await screen.findByText('Gols, por 90')).toBeInTheDocument()
    expect(screen.getByText('Competição e temporada')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(
      screen.getByText('Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor.'),
    ).toBeInTheDocument()
  })

  it('abre com o nome, a linha de apoio e a aba de metricas selecionada', async () => {
    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Rafael Montes' })).toBeInTheDocument()
    expect(screen.getByText('Meio-campo, 27 anos, Atlético Serrano')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Métricas por 90' })).toHaveAttribute('aria-selected', 'true')
  })

  it('mostra a navegacao no topo', async () => {
    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    expect(await screen.findByText('Buscar jogador')).toBeInTheDocument()
    for (const item of ['Acompanhamentos', 'Shortlists', 'Relatórios', 'Sair']) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
  })

  it('nunca mostra a palavra recorte', async () => {
    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    await screen.findByText('0,35')
    expect(document.body).not.toHaveTextContent(/recorte/i)
  })
})

describe('troca de recorte', () => {
  it('grava o novo recorte na URL e o Voltar retorna o anterior', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)
    const select = await screen.findByRole('combobox', { name: 'Competição e temporada' })
    await screen.findByText('0,35')

    // Act
    await user.selectOptions(select, 'Seleção · Eliminatórias Sul-Americanas · 2025')

    // Assert
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ competicao: 295, temporada: 72034, contexto: 'Selecao' }),
    )
    expect(router.history.length).toBe(2)

    router.history.back()
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ competicao: 325, temporada: 72034, contexto: 'Clube' }),
    )
    expect(
      within(screen.getByRole('combobox')).getByRole('option', { selected: true }),
    ).toHaveTextContent('Clube · Brasileirão Série A · 2025')
  })

  it('so a grade volta aos blocos enquanto o novo recorte carrega', async () => {
    // Arrange
    const user = userEvent.setup()
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)
    const select = await screen.findByRole('combobox', { name: 'Competição e temporada' })
    await screen.findByText('0,35')
    server.use(pendingForever())

    // Act
    await user.selectOptions(select, 'Seleção · Eliminatórias Sul-Americanas · 2025')

    // Assert
    await waitFor(() => expect(screen.queryByText('0,35')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { level: 1, name: 'Rafael Montes' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Competição e temporada' })).toBeInTheDocument()
    expect(screen.getByText('Gols, por 90')).toBeInTheDocument()
  })
})

describe('recusas', () => {
  it('mostra as linhas recusadas e a amostra que difere do rodape', async () => {
    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    expect(await screen.findByText('Não publicado pela fonte')).toBeInTheDocument()
    expect(screen.getByText('Interceptações, por 90')).toBeInTheDocument()
    expect(screen.getByText('86,4%')).toBeInTheDocument()
    expect(screen.getByText('1.190 min jogados')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Amostra: 1.284 min jogados. Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor.',
      ),
    ).toBeInTheDocument()
  })

  it('mostra a grade toda recusada sem mensagem de erro', async () => {
    // Act
    renderRoute(`/jogadores/1001/metricas${COPA_DO_BRASIL_2025}`)

    // Assert
    expect(await screen.findAllByText('Amostra insuficiente: 312 de 450 min')).toHaveLength(7)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra o perfil sem estatisticas sem seletor e sem pedir metricas', async () => {
    // Arrange
    const requests = metricsRequests()

    // Act
    renderRoute('/jogadores/1003/metricas')

    // Assert
    expect(await screen.findByText('Sem estatísticas publicadas para este jogador.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Lucas Prado' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByText('Gols, por 90')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(requests).toHaveLength(0)
  })
})

describe('erros', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('mostra so o titulo e a mensagem quando o perfil nao existe', async () => {
    // Act
    renderRoute('/jogadores/1004/metricas')

    // Assert
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Jogador não encontrado.')
    expect(screen.getByRole('heading', { name: 'Métricas por 90' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByText('Gols, por 90')).not.toBeInTheDocument()
  })

  it('oferece nova tentativa quando a fonte do perfil esta fora do ar', async () => {
    // Arrange
    server.use(profileSourceDown)

    // Act
    renderRoute('/jogadores/1001/metricas')

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar o perfil agora.')
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
  })

  it('mantem nome e seletor e oferece nova tentativa quando as metricas falham', async () => {
    // Arrange
    const user = userEvent.setup()
    const requests = metricsRequests()
    renderRoute(`/jogadores/1005/metricas${BRASILEIRAO_2025}`)
    expect(await screen.findByRole('alert')).toHaveTextContent('Estatísticas indisponíveis no momento.')
    expect(requests).toHaveLength(2)

    // Act
    server.use(pendingForever())
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    // Assert
    expect(requests).toHaveLength(3)
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { level: 1, name: 'Bruno Lacerda' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Competição e temporada' })).toBeInTheDocument()
    expect(screen.getByText('Gols, por 90')).toBeInTheDocument()
  })

  it('repete o 502 uma vez sem mostrar erro quando a repeticao responde', async () => {
    // Arrange
    let calls = 0
    server.use(
      http.get(METRICS, ({ params, response }) => {
        calls += 1
        if (calls === 1) {
          return response.untyped(problem(502, 'sofascore.estatisticas_do_jogador_indisponiveis'))
        }
        return response(200).json(metricsResponse(calculatedAttributes, Number(params.jogadorId)))
      }),
    )

    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    expect(await screen.findByText('0,35')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(calls).toBe(2)
  })

  it('mostra o erro generico quando as metricas falham sem code', async () => {
    // Arrange
    server.use(metricsWithoutCode)

    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível concluir agora.')
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
  })

  it('mostra o erro generico quando a resposta chega incompleta', async () => {
    // Arrange
    server.use(incompleteMetrics)

    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível concluir agora.')
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Rafael Montes' })).toBeInTheDocument()
  })
})

describe('titulo da aba', () => {
  it('leva o nome do jogador quando o perfil carrega', async () => {
    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    await waitFor(() => expect(document.title).toBe('Métricas por 90 · Rafael Montes'))
  })

  it('fica so com o nome da tela quando o perfil falha', async () => {
    // Arrange
    document.title = ''

    // Act
    renderRoute('/jogadores/1004/metricas')

    // Assert
    await screen.findByRole('alert')
    expect(document.title).toBe('Métricas por 90')
  })
})
