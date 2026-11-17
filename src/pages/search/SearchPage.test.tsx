import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { allPlayerResults, teamResult } from '../../mocks/fixtures/search'
import {
  searchBlankTerm,
  searchEmpty,
  searchOnlyTeams,
  searchPending,
  searchSourceDown,
} from '../../mocks/handlers/search'
import { http } from '../../mocks/http'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const searchRequests = () => {
  const terms: string[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (url.pathname === '/api/Players/search') terms.push(url.searchParams.get('q') ?? '')
  })
  return terms
}

const pageField = () => screen.getByRole('searchbox', { name: 'Nome do jogador' })
const topField = () => screen.queryByRole('searchbox', { name: 'Buscar jogador' })
const results = () => screen.getByRole('list', { name: 'Resultados' })

describe('resultados da busca', () => {
  it('lista so os jogadores, na ordem da fonte, com a linha de apoio', async () => {
    // Arrange
    const [rafael, caio] = allPlayerResults()
    server.use(
      http.get('/api/Players/search', ({ response }) =>
        response(200).json({ results: [caio, teamResult(), rafael] }),
      ),
    )

    // Act
    renderRoute('/busca?termo=atletico')

    // Assert
    const links = within(await screen.findByRole('list', { name: 'Resultados' })).getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveTextContent('Caio Ventura')
    expect(links[0]).toHaveTextContent('Ataque, Atlético Serrano, Brasil')
    expect(links[1]).toHaveTextContent('Rafael Montes')
    expect(pageField()).toHaveValue('atletico')
  })

  it('mostra so o nome quando a fonte nao traz posicao, clube nem pais', async () => {
    // Act
    renderRoute('/busca?termo=miguel')

    // Assert
    const link = await screen.findByRole('link', { name: 'Miguel Torres' })
    expect(link).toHaveTextContent(/^Miguel Torres$/)
  })

  it('abre o perfil pelo resultado', async () => {
    // Arrange
    const { router } = renderRoute('/busca?termo=rafael')

    // Act
    await userEvent.click(await screen.findByRole('link', { name: /Rafael Montes/ }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001'))
  })

  it('mostra cinco linhas de espera enquanto a fonte responde', async () => {
    // Arrange
    server.use(searchPending)

    // Act
    renderRoute('/busca?termo=rafael')

    // Assert
    const placeholder = await screen.findByRole('status', { name: 'Carregando resultados' })
    expect(within(placeholder).getAllByRole('listitem')).toHaveLength(5)
    expect(pageField()).toHaveValue('rafael')
  })

  it('avisa quando nao ha jogador para o termo', async () => {
    // Arrange
    server.use(searchEmpty)

    // Act
    renderRoute('/busca?termo=xyzabc')

    // Assert
    expect(
      await screen.findByText('Nenhum jogador encontrado para "xyzabc". Confira a grafia ou busque pelo sobrenome.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
  })

  it('avisa quando so vieram times e competicoes', async () => {
    // Arrange
    server.use(searchOnlyTeams)

    // Act
    renderRoute('/busca?termo=serrano')

    // Assert
    expect(
      await screen.findByText('Nenhum jogador encontrado para "serrano". Confira a grafia ou busque pelo sobrenome.'),
    ).toBeInTheDocument()
  })

  it('oferece Tentar de novo quando a fonte esta fora', async () => {
    // Arrange
    server.use(searchSourceDown)
    const terms = searchRequests()
    renderRoute('/busca?termo=rafael')
    await screen.findByText('Não foi possível buscar agora.')
    expect(pageField()).toHaveValue('rafael')
    server.use(searchPending)

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    // Assert
    expect(await screen.findByRole('status', { name: 'Carregando resultados' })).toBeInTheDocument()
    expect(terms).toHaveLength(3)
  })

  it('mostra o erro generico sem Tentar de novo numa recusa inesperada', async () => {
    // Arrange
    server.use(searchBlankTerm)

    // Act
    renderRoute('/busca?termo=rafael')

    // Assert
    expect(await screen.findByText('Não foi possível concluir agora.')).toBeInTheDocument()
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
  })
})

describe('envio do termo', () => {
  it('abre so o campo, focado, sem termo', async () => {
    // Arrange
    const terms = searchRequests()

    // Act
    renderRoute('/busca')

    // Assert
    expect(await screen.findByRole('searchbox', { name: 'Nome do jogador' })).toHaveFocus()
    expect(screen.queryByRole('list', { name: 'Resultados' })).not.toBeInTheDocument()
    expect(terms).toEqual([])
    expect(document.title).toBe('Buscar jogador')
  })

  it('grava o termo sem espacos na URL ao enviar', async () => {
    // Arrange
    const { router } = renderRoute('/busca')

    // Act
    await userEvent.type(await screen.findByRole('searchbox', { name: 'Nome do jogador' }), '  rafael {Enter}')

    // Assert
    await waitFor(() => expect(router.state.location.search).toEqual({ termo: 'rafael' }))
    expect(within(await screen.findByRole('list', { name: 'Resultados' })).getByText('Rafael Montes')).toBeInTheDocument()
  })

  it('nao busca enquanto o olheiro digita', async () => {
    // Arrange
    const terms = searchRequests()
    renderRoute('/busca')

    // Act
    await userEvent.type(await screen.findByRole('searchbox', { name: 'Nome do jogador' }), 'rafael')

    // Assert
    expect(terms).toEqual([])
  })

  it('pede pelo menos 2 letras e limpa a mensagem na letra seguinte', async () => {
    // Arrange
    const terms = searchRequests()
    renderRoute('/busca')
    const field = await screen.findByRole('searchbox', { name: 'Nome do jogador' })

    // Act
    await userEvent.type(field, 's')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    // Assert
    expect(field).toHaveAccessibleDescription('Digite pelo menos 2 letras do nome.')
    expect(terms).toEqual([])
    await userEvent.type(field, 'i')
    expect(screen.queryByText('Digite pelo menos 2 letras do nome.')).not.toBeInTheDocument()
  })

  it('trata termo curto na URL como ausente, sem mensagem', async () => {
    // Arrange
    const terms = searchRequests()

    // Act
    renderRoute('/busca?termo=s')

    // Assert
    expect(await screen.findByRole('searchbox', { name: 'Nome do jogador' })).toHaveValue('s')
    expect(screen.queryByText('Digite pelo menos 2 letras do nome.')).not.toBeInTheDocument()
    expect(terms).toEqual([])
  })

  it('volta para a busca anterior com o Voltar do navegador', async () => {
    // Arrange
    const { router } = renderRoute('/busca?termo=rafael')
    await within(await screen.findByRole('list', { name: 'Resultados' })).findByText('Rafael Montes')
    const field = pageField()
    await userEvent.clear(field)
    await userEvent.type(field, 'caio{Enter}')
    await within(results()).findByText('Caio Ventura')

    // Act
    router.history.back()

    // Assert
    await waitFor(() => expect(pageField()).toHaveValue('rafael'))
    expect(await within(results()).findByText('Rafael Montes')).toBeInTheDocument()
  })

})

describe('busca do topo', () => {
  it('leva para a busca e some na pagina de busca', async () => {
    // Arrange
    const { router } = renderRoute('/jogadores/1001/metricas?competicao=325&temporada=72034&contexto=Clube')
    await screen.findByRole('heading', { name: 'Rafael Montes' })

    // Act
    await userEvent.type(topField()!, 'rafael{Enter}')

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/busca'))
    expect(router.state.location.search).toEqual({ termo: 'rafael' })
    expect(await screen.findByRole('searchbox', { name: 'Nome do jogador' })).toHaveValue('rafael')
    expect(topField()).not.toBeInTheDocument()
  })

  it('pede pelo menos 2 letras no topo, sem trocar de pagina', async () => {
    // Arrange
    const { router } = renderRoute('/jogadores/1001/metricas?competicao=325&temporada=72034&contexto=Clube')
    await screen.findByRole('heading', { name: 'Rafael Montes' })

    // Act
    await userEvent.type(topField()!, 's{Enter}')

    // Assert
    expect(topField()).toHaveAccessibleDescription('Digite pelo menos 2 letras do nome.')
    expect(router.state.location.pathname).toBe('/jogadores/1001/metricas')
  })

  it('mostra o link Buscar para o celular fora da pagina de busca', async () => {
    // Act
    renderRoute('/jogadores/1001/metricas?competicao=325&temporada=72034&contexto=Clube')

    // Assert
    await screen.findByRole('heading', { name: 'Rafael Montes' })
    expect(screen.getByRole('link', { name: 'Buscar' })).toHaveAttribute('href', '/busca')
  })
})

describe('inicio com a busca', () => {
  it('busca pelo campo da pagina inicial', async () => {
    // Arrange
    const { router } = renderRoute('/')
    await screen.findByRole('heading', { name: 'Olá, Ana.' })

    // Act
    await userEvent.type(pageField(), 'rafael')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/busca'))
    expect(router.state.location.search).toEqual({ termo: 'rafael' })
  })

  it('nao lista mais os jogadores de teste', async () => {
    // Act
    renderRoute('/')

    // Assert
    await screen.findByRole('heading', { name: 'Olá, Ana.' })
    expect(screen.queryByText('Jogadores de teste')).not.toBeInTheDocument()
  })
})
