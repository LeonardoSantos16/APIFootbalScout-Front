import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildProfileWithoutStats } from '../../mocks/fixtures/profiles'
import { allPlayerResults } from '../../mocks/fixtures/search'
import { http } from '../../mocks/http'
import { problem } from '../../mocks/responses'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const COMPARISON = '/api/Analise/comparacao'
const BRASILEIRAO_2025 = 'competicao=325&temporada=72034&contexto=Clube'
const COPA_DO_BRASIL_LABEL = 'Clube · Copa do Brasil · 2025'
const TAB = `/jogadores/1001/comparacao?${BRASILEIRAO_2025}`

const requests = (fragment: string) => {
  const urls: URL[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (url.pathname.includes(fragment)) urls.push(url)
  })
  return urls
}

const everyPlayerSearch = () =>
  http.get('/api/Players/search', ({ response }) => response(200).json({ results: allPlayerResults() }))

const searchFor = async (term: string) => {
  const field = await screen.findByRole('searchbox', { name: 'Nome do jogador' })
  await userEvent.type(field, `${term}{Enter}`)
}

const findLoadedTable = async () => {
  const table = await screen.findByRole('table')
  await waitFor(() => expect(screen.queryByRole('status', { name: 'Carregando comparação' })).not.toBeInTheDocument())
  return screen.getByRole('table') ?? table
}

const tableRow = (label: string) => screen.getByRole('row', { name: new RegExp(label) })

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-17T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  server.events.removeAllListeners()
})

describe('aba Comparação', () => {
  it('abre com a aba selecionada sem pedir o perfil de novo', async () => {
    // Arrange
    const profiles = requests('/profile')

    // Act
    renderRoute(TAB)

    // Assert
    const tab = await screen.findByRole('link', { name: 'Comparação' })
    expect(tab).toHaveAttribute('aria-current', 'page')
    await screen.findByText('Escolha com quem comparar Rafael Montes nesta competição e temporada.')
    expect(profiles).toHaveLength(1)
  })

  it('poe o nome do jogador no titulo da aba do navegador', async () => {
    // Act
    renderRoute(TAB)

    // Assert
    await waitFor(() => expect(document.title).toBe('Comparação · Rafael Montes'))
  })

  it('corrige a URL sem recorte para o primeiro da ordem', async () => {
    // Act
    const { router } = renderRoute('/jogadores/1001/comparacao')

    // Assert
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ competicao: 325, temporada: 72034, contexto: 'Clube' }),
    )
    expect(router.history.length).toBe(1)
  })

  it('nao pede a comparacao sem segundo jogador', async () => {
    // Arrange
    const comparisons = requests('comparacao')

    // Act
    renderRoute(TAB)

    // Assert
    await screen.findByRole('searchbox', { name: 'Nome do jogador' })
    expect(comparisons).toHaveLength(0)
  })
})

describe('busca do segundo jogador', () => {
  it('lista so os jogadores comparaveis com o meio-campo', async () => {
    // Arrange
    server.use(everyPlayerSearch())
    const { router } = renderRoute(TAB)

    // Act
    await searchFor('atlético')

    // Assert
    const results = await screen.findByRole('list', { name: 'Resultados' })
    expect(within(results).getAllByRole('link').map((link) => link.textContent)).toEqual([
      expect.stringContaining('Caio Ventura'),
      expect.stringContaining('Lucas Prado'),
      expect.stringContaining('Bruno Lacerda'),
      expect.stringContaining('Diego Albuquerque'),
    ])
    expect(screen.getByText('Mostrando só jogadores comparáveis com meio-campo.')).toBeInTheDocument()
    expect(router.state.location.search).not.toHaveProperty('termo')
  })

  it('pede pelo menos duas letras', async () => {
    // Arrange
    const searches = requests('/search')
    renderRoute(TAB)

    // Act
    await searchFor('s')

    // Assert
    expect(await screen.findByText('Digite pelo menos 2 letras do nome.')).toBeInTheDocument()
    expect(searches).toHaveLength(0)
  })

  it('diz quando a busca so achou jogadores nao comparaveis', async () => {
    // Arrange
    renderRoute(TAB)

    // Act
    await searchFor('pedro')

    // Assert
    expect(await screen.findByText('Nenhum jogador comparável com meio-campo para "pedro".')).toBeInTheDocument()
  })

  it('usa o texto da busca quando nao acha jogador nenhum', async () => {
    // Arrange
    renderRoute(TAB)

    // Act
    await searchFor('vazio')

    // Assert
    expect(
      await screen.findByText('Nenhum jogador encontrado para "vazio". Confira a grafia ou busque pelo sobrenome.'),
    ).toBeInTheDocument()
  })
})

describe('comparacao realizada', () => {
  it('grava o segundo jogador na URL e mostra a tabela com o jogador da pagina a esquerda', async () => {
    // Arrange
    server.use(everyPlayerSearch())
    const { router } = renderRoute(TAB)
    await searchFor('diego')

    // Act
    await userEvent.click(await screen.findByRole('link', { name: /Diego Albuquerque/ }))

    // Assert
    await waitFor(() => expect(router.state.location.search).toMatchObject({ com: 1006 }))
    const table = await findLoadedTable()
    const headers = within(table).getAllByRole('columnheader').map((header) => header.textContent)
    expect(headers[1]).toContain('Rafael Montes')
    expect(headers[2]).toContain('Diego Albuquerque')
  })

  it('destaca o maior valor e nao destaca o empate', async () => {
    // Act
    renderRoute(`${TAB}&com=1006`)

    // Assert
    await findLoadedTable()
    const goals = within(tableRow('Gols, por 90')).getAllByRole('cell')
    expect(goals.map((cell) => cell.textContent)).toEqual(['0,19', '0,46'])
    expect(goals[1]).toHaveAttribute('data-tone', 'strong')
    expect(goals[0]).toHaveAttribute('data-tone', 'muted')
    const interceptions = within(tableRow('Interceptações, por 90')).getAllByRole('cell')
    expect(interceptions.map((cell) => cell.getAttribute('data-tone'))).toEqual(['neutral', 'neutral'])
  })

  it('volta para a busca pelo voltar do navegador', async () => {
    // Arrange
    server.use(everyPlayerSearch())
    const { router } = renderRoute(TAB)
    await searchFor('diego')
    await userEvent.click(await screen.findByRole('link', { name: /Diego Albuquerque/ }))
    await findLoadedTable()

    // Act
    router.history.back()

    // Assert
    expect(await screen.findByRole('searchbox', { name: 'Nome do jogador' })).toBeInTheDocument()
    expect(router.state.location.search).not.toHaveProperty('com')
  })

  it('mostra o motivo na celula recusada de um lado so', async () => {
    // Act
    renderRoute(`${TAB}&com=1005`)

    // Assert
    await findLoadedTable()
    const precision = within(tableRow('Precisão de passe')).getAllByRole('cell')
    expect(precision.map((cell) => cell.textContent)).toEqual(['87,4%', 'Não publicado pela fonte'])
    expect(precision[0]).toHaveAttribute('data-tone', 'neutral')
  })

  it('troca o jogador e volta para a busca', async () => {
    // Arrange
    const { router } = renderRoute(`${TAB}&com=1006`)
    await findLoadedTable()

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Trocar jogador' }))

    // Assert
    expect(await screen.findByRole('searchbox', { name: 'Nome do jogador' })).toHaveValue('')
    expect(router.state.location.search).not.toHaveProperty('com')
  })

  it('mantem o segundo jogador ao trocar o recorte', async () => {
    // Arrange
    const comparisons = requests('comparacao')
    const { router } = renderRoute(`${TAB}&com=1006`)
    await findLoadedTable()

    // Act
    await userEvent.selectOptions(screen.getByLabelText('Competição e temporada'), COPA_DO_BRASIL_LABEL)

    // Assert
    await waitFor(() => expect(router.state.location.search).toMatchObject({ competicao: 373, com: 1006 }))
    await waitFor(() => expect(comparisons.at(-1)?.searchParams.get('CompeticaoId')).toBe('373'))
  })

  it('mostra blocos no lugar dos valores enquanto a comparacao carrega', async () => {
    // Arrange
    server.use(
      http.get(COMPARISON, async () => {
        await delay('infinite')
        return new Response(null)
      }),
    )

    // Act
    renderRoute(`${TAB}&com=1006`)

    // Assert
    expect(await screen.findByRole('status', { name: 'Carregando comparação' })).toBeInTheDocument()
    expect(screen.queryByText('0,46')).not.toBeInTheDocument()
  })

  it('reaproveita a comparacao ao voltar de outra aba', async () => {
    // Arrange
    const comparisons = requests('comparacao')
    renderRoute(`${TAB}&com=1006`)
    await findLoadedTable()

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Métricas' }))
    await screen.findByText('0,35')
    await userEvent.click(screen.getByRole('link', { name: 'Comparação' }))

    // Assert
    await findLoadedTable()
    expect(comparisons).toHaveLength(1)
  })
})

describe('comparacao recusada', () => {
  it('explica as posicoes incompativeis com os dois jogadores', async () => {
    // Act
    renderRoute(`${TAB}&com=1004`)

    // Assert
    expect(await screen.findByText('Goleiro e meio-campo não são comparáveis.')).toBeInTheDocument()
    expect(screen.getByText('Pedro Nunes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Escolher outro jogador' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('explica a posicao desconhecida', async () => {
    // Act
    renderRoute(`${TAB}&com=1007`)

    // Assert
    expect(await screen.findByText('A fonte não informou a posição de Miguel Torres.')).toBeInTheDocument()
    expect(screen.getByText('Posição não informada')).toBeInTheDocument()
  })

  it('atribui a falta de amostra ao segundo jogador', async () => {
    // Act
    renderRoute(`${TAB}&com=1003`)

    // Assert
    expect(
      await screen.findByText(
        'Lucas Prado não tem minutos suficientes nesta competição e temporada (mínimo 450 min).',
      ),
    ).toBeInTheDocument()
  })

  it('atribui a falta de amostra ao jogador da pagina no recorte com poucos minutos', async () => {
    // Act
    renderRoute('/jogadores/1001/comparacao?competicao=373&temporada=72034&contexto=Clube&com=1006')

    // Assert
    expect(await screen.findByText('Rafael Montes tem 312 de 450 min nesta competição e temporada.')).toBeInTheDocument()
  })

  it('escolhe outro jogador a partir da recusa', async () => {
    // Arrange
    const { router } = renderRoute(`${TAB}&com=1004`)

    // Act
    await userEvent.click(await screen.findByRole('button', { name: 'Escolher outro jogador' }))

    // Assert
    expect(await screen.findByRole('searchbox', { name: 'Nome do jogador' })).toBeInTheDocument()
    expect(router.state.location.search).not.toHaveProperty('com')
  })
})

describe('segundo jogador sem dados', () => {
  it('usa o nome clicado quando ele nao tem estatisticas no recorte', async () => {
    // Arrange
    server.use(everyPlayerSearch())
    renderRoute(TAB)
    await searchFor('caio')

    // Act
    await userEvent.click(await screen.findByRole('link', { name: /Caio Ventura/ }))

    // Assert
    expect(
      await screen.findByText('Caio Ventura não tem estatísticas em Brasileirão Série A · 2025.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Escolher outro jogador' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
  })

  it('fala do jogador escolhido quando veio pela URL', async () => {
    // Act
    renderRoute(`${TAB}&com=1002`)

    // Assert
    expect(
      await screen.findByText('O jogador escolhido não tem estatísticas em Brasileirão Série A · 2025.'),
    ).toBeInTheDocument()
  })

  it('diz que o jogador escolhido nao foi encontrado', async () => {
    // Arrange
    server.use(
      http.get(COMPARISON, ({ response }) =>
        response.untyped(problem(404, 'jogador.perfil_nao_encontrado', 'GET /api/Analise/comparacao')),
      ),
    )

    // Act
    renderRoute(`${TAB}&com=9999`)

    // Assert
    expect(await screen.findByText('O jogador escolhido não foi encontrado.')).toBeInTheDocument()
  })
})

describe('URL com segundo jogador invalido', () => {
  it('descarta o mesmo jogador dos dois lados sem criar entrada no historico', async () => {
    // Arrange
    const comparisons = requests('comparacao')

    // Act
    const { router } = renderRoute(`${TAB}&com=1001`)

    // Assert
    expect(await screen.findByRole('searchbox', { name: 'Nome do jogador' })).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.search).not.toHaveProperty('com'))
    expect(router.history.length).toBe(1)
    expect(comparisons).toHaveLength(0)
  })

  it('descarta um id malformado', async () => {
    // Act
    const { router } = renderRoute(`${TAB}&com=abc`)

    // Assert
    expect(await screen.findByRole('searchbox', { name: 'Nome do jogador' })).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.search).not.toHaveProperty('com'))
  })
})

describe('falhas', () => {
  it('oferece nova tentativa e troca de jogador com a fonte fora', async () => {
    // Arrange
    const comparisons = requests('comparacao')
    server.use(
      http.get(COMPARISON, ({ response }) =>
        response.untyped(problem(502, 'sofascore.estatisticas_do_jogador_indisponiveis')),
      ),
    )
    renderRoute(`${TAB}&com=1006`)
    const retry = await screen.findByRole('button', { name: 'Tentar de novo' })
    expect(screen.getByText('Não foi possível comparar agora.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trocar jogador' })).toBeInTheDocument()
    expect(screen.getByLabelText('Competição e temporada')).toBeInTheDocument()

    // Act
    await userEvent.click(retry)

    // Assert
    await waitFor(() => expect(comparisons.length).toBeGreaterThan(2))
  })

  it('mostra o estado sem estatisticas sem a busca', async () => {
    // Arrange
    server.use(
      http.get('/api/Players/{id}/profile', ({ response }) => response(200).json(buildProfileWithoutStats(1001))),
    )
    const comparisons = requests('comparacao')

    // Act
    renderRoute(`/jogadores/1001/comparacao?com=1006`)

    // Assert
    expect(await screen.findByText('Sem estatísticas publicadas para este jogador.')).toBeInTheDocument()
    expect(screen.queryByRole('searchbox', { name: 'Nome do jogador' })).not.toBeInTheDocument()
    expect(comparisons).toHaveLength(0)
  })
})

describe('troca de aba', () => {
  it('mantem o recorte e o segundo jogador ao ir para as metricas e voltar', async () => {
    // Arrange
    const { router } = renderRoute(`${TAB}&com=1006`)
    await findLoadedTable()

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Métricas' }))
    await screen.findByText('0,35')
    await userEvent.click(screen.getByRole('link', { name: 'Comparação' }))

    // Assert
    await findLoadedTable()
    expect(router.state.location.search).toEqual({ competicao: 325, temporada: 72034, contexto: 'Clube', com: 1006 })
  })
})
