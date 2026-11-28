import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { profilePending, profileSourceDown } from '../../mocks/handlers/profile'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const COPA_DO_BRASIL_2025 = { competicao: 373, temporada: 72034, contexto: 'Clube' }

const requestsTo = (suffix: string) => {
  const paths: string[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (url.pathname.endsWith(suffix)) paths.push(url.pathname + url.search)
  })
  return paths
}

const card = (title: string) => {
  const section = screen.getByRole('heading', { name: title }).closest('section')
  if (!section) throw new Error(`Cartão ${title} não encontrado`)
  return within(section)
}

const openProfile = async (url = '/jogadores/1001', name = 'Rafael Montes') => {
  const rendered = renderRoute(url)
  await screen.findByRole('heading', { level: 1, name })
  return rendered
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-17T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('layout do jogador', () => {
  it('abre com a faixa, as iniciais e a aba Perfil selecionada', async () => {
    // Act
    await openProfile()

    // Assert
    expect(screen.getByText('Meio-campo, 27 anos, Atlético Serrano')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Rafael Montes' })).toHaveTextContent('RM')
    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Métricas' })).not.toHaveAttribute('aria-current')
    expect(document.title).toBe('Rafael Montes · APIFootballScout')
  })

  it('mostra blocos e abas desabilitadas enquanto o perfil carrega', async () => {
    // Arrange
    server.use(profilePending)

    // Act
    renderRoute('/jogadores/1001')

    // Assert
    const disabled = await screen.findByText('Perfil')
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByRole('link', { name: 'Perfil' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Métricas' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(document.title).toBe('Perfil · APIFootballScout')
  })

  it('mostra Jogador nao encontrado com o caminho para a busca', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { router } = renderRoute('/jogadores/1004')
    expect(await screen.findByRole('alert')).toHaveTextContent('Jogador não encontrado.')
    expect(screen.queryByRole('link', { name: 'Perfil' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
    expect(document.title).toBe('Jogador não encontrado · APIFootballScout')

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Buscar jogador' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/busca'))
  })

  it('oferece nova tentativa quando a fonte do perfil esta fora', async () => {
    // Arrange
    server.use(profileSourceDown)
    const profiles = requestsTo('/profile')

    // Act
    renderRoute('/jogadores/1001')

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar o perfil agora.')
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Perfil' })).not.toBeInTheDocument()
    expect(profiles).toHaveLength(2)
    expect(document.title).toBe('Perfil · APIFootballScout')
  })
})

describe('cartoes do perfil', () => {
  it('mostra os dados do jogador', async () => {
    // Act
    await openProfile()

    // Assert
    const data = card('Dados')
    for (const text of [
      'Meio-campo',
      'Posição · MC, ME',
      '14/03/1999 (27 anos)',
      '178 cm',
      'Direito',
      'Pé preferido',
      '8',
      'Camisa',
      'Brasil, 12 jogos, 2 gols',
      'Seleção',
    ]) {
      expect(data.getByText(text)).toBeInTheDocument()
    }
  })

  it('mostra o valor de mercado da fonte', async () => {
    // Act
    await openProfile()

    // Assert
    const market = card('Valor de mercado')
    expect(market.getByText('€12,5M')).toBeInTheDocument()
    expect(market.getByText('Estimativa da fonte')).toBeInTheDocument()
  })

  it('lista os recortes na ordem da fonte, com os numeros', async () => {
    // Act
    await openProfile()

    // Assert
    const links = within(screen.getByRole('list', { name: 'Recortes' })).getAllByRole('link')
    const titles = [
      'Clube · Brasileirão Série A · 2025',
      'Seleção · Eliminatórias Sul-Americanas · 2025',
      'Clube · Copa do Brasil · 2025',
      'Clube · Brasileirão Série A · 2024',
    ]
    expect(links).toHaveLength(titles.length)
    titles.forEach((title, index) => expect(links[index]).toHaveTextContent(title))
    expect(links[0]).toHaveTextContent('1.284')
    expect(links[0]).toHaveTextContent('7,12')
    for (const column of ['Jogos', 'Minutos', 'Gols', 'Assist.', 'Nota']) {
      expect(card('Recortes').getByText(column)).toBeInTheDocument()
    }
  })

  it('lista as transferencias da mais recente para a mais antiga', async () => {
    // Act
    await openProfile()

    // Assert
    const items = within(screen.getByRole('list', { name: 'Transferências' })).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Serra Azul → Atlético Serrano')
    expect(items[0]).toHaveTextContent('jan. 2024 · €3,2M')
    expect(items[1]).toHaveTextContent('jul. 2022 · Empréstimo')
    expect(items[2]).toHaveTextContent(/jan\. 2020$/)
  })

  it('corta as listas longas e mostra o resto na mesma pagina', async () => {
    // Arrange
    const { router } = await openProfile('/jogadores/1006', 'Diego Albuquerque')
    const slices = () => within(screen.getByRole('list', { name: 'Recortes' })).getAllByRole('listitem')
    const transfers = () => within(screen.getByRole('list', { name: 'Transferências' })).getAllByRole('listitem')
    expect(slices()).toHaveLength(10)
    expect(transfers()).toHaveLength(5)

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar todos os recortes (14)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar todas as transferências (8)' }))

    // Assert
    expect(slices()).toHaveLength(14)
    expect(transfers()).toHaveLength(8)
    expect(screen.queryByRole('button', { name: /Mostrar todos/ })).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/jogadores/1006')
  })

  it('esconde o que a fonte nao publicou', async () => {
    // Act
    await openProfile('/jogadores/1007', 'Miguel Torres')

    // Assert
    expect(screen.getByText('Defesa, Atlético Serrano')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Miguel Torres' })).toHaveTextContent('MT')
    expect(screen.queryByRole('heading', { name: 'Valor de mercado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Transferências' })).not.toBeInTheDocument()
    for (const label of ['Altura', 'Camisa', 'Pé preferido', 'Nascimento', 'Seleção']) {
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    }
  })

  it('mostra o perfil sem estatisticas com o resto dos cartoes', async () => {
    // Act
    await openProfile('/jogadores/1003', 'Lucas Prado')

    // Assert
    expect(card('Recortes').getByText('Sem estatísticas publicadas para este jogador.')).toBeInTheDocument()
    expect(card('Dados').getByText('Defesa')).toBeInTheDocument()
  })
})

describe('navegacao entre as abas', () => {
  it('abre as metricas no recorte da linha clicada', async () => {
    // Arrange
    const { router } = await openProfile()

    // Act
    await userEvent.click(screen.getByRole('link', { name: /Clube · Copa do Brasil · 2025/ }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/metricas'))
    expect(router.state.location.search).toEqual(COPA_DO_BRASIL_2025)
    expect(screen.getByRole('link', { name: 'Métricas' })).toHaveAttribute('aria-current', 'page')
  })

  it('mantem o recorte ao ir para o perfil e voltar para as metricas', async () => {
    // Arrange
    const { router } = renderRoute('/jogadores/1001/metricas?competicao=373&temporada=72034&contexto=Clube')
    await screen.findByRole('combobox', { name: 'Competição e temporada' })

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Perfil' }))
    await screen.findByRole('heading', { name: 'Dados' })
    await userEvent.click(screen.getByRole('link', { name: 'Métricas' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/metricas'))
    expect(router.state.location.search).toEqual(COPA_DO_BRASIL_2025)
    expect(
      within(await screen.findByRole('combobox', { name: 'Competição e temporada' })).getByRole('option', {
        selected: true,
      }),
    ).toHaveTextContent('Clube · Copa do Brasil · 2025')
  })

  it('abre as metricas no primeiro recorte quando o perfil nao tem recorte na URL', async () => {
    // Arrange
    const { router } = await openProfile()

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Métricas' }))

    // Assert
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ competicao: 325, temporada: 72034, contexto: 'Clube' }),
    )
  })

  it('nao pede o perfil de novo ao trocar de aba', async () => {
    // Arrange
    const profiles = requestsTo('/profile')
    await openProfile()

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Métricas' }))
    await screen.findByRole('combobox', { name: 'Competição e temporada' })
    await userEvent.click(screen.getByRole('link', { name: 'Perfil' }))
    await screen.findByRole('heading', { name: 'Dados' })

    // Assert
    expect(profiles).toHaveLength(1)
    expect(document.title).toBe('Rafael Montes · APIFootballScout')
  })

  it('reaproveita o perfil ao abrir de novo pela busca', async () => {
    // Arrange
    const profiles = requestsTo('/profile')
    await openProfile()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar jogador' }), 'rafael{Enter}')

    // Act
    await userEvent.click(await screen.findByRole('link', { name: /Rafael Montes/ }))

    // Assert
    expect(await screen.findByRole('heading', { name: 'Dados' })).toBeInTheDocument()
    expect(profiles).toHaveLength(1)
  })
})

describe('volta para a busca', () => {
  it('reaproveita os resultados ao voltar do perfil', async () => {
    // Arrange
    const searches = requestsTo('/api/Players/search')
    const { router } = renderRoute('/busca?termo=rafael')
    await userEvent.click(await screen.findByRole('link', { name: /Rafael Montes/ }))
    await screen.findByRole('heading', { level: 1, name: 'Rafael Montes' })

    // Act
    router.history.back()

    // Assert
    expect(
      await within(await screen.findByRole('list', { name: 'Resultados' })).findByText('Rafael Montes'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Carregando resultados' })).not.toBeInTheDocument()
    expect(searches).toHaveLength(1)
  })

  it('deixa o campo do topo vazio depois de sair da busca', async () => {
    // Arrange
    renderRoute('/busca?termo=rafael')

    // Act
    await userEvent.click(await screen.findByRole('link', { name: /Rafael Montes/ }))

    // Assert
    await screen.findByRole('heading', { level: 1, name: 'Rafael Montes' })
    expect(screen.getByRole('searchbox', { name: 'Buscar jogador' })).toHaveValue('')
  })
})
