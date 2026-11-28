import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SHORTLIST_IDS } from '../../mocks/fixtures/shortlists'
import {
  shortlistsEmpty,
  shortlistsList,
  shortlistsMoreThanFive,
  shortlistsPending,
  shortlistsSourceDown,
  shortlistsUnknownError,
} from '../../mocks/handlers/shortlists'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const LIST = 'Suas shortlists'

const shortlistsRequests = () => {
  let count = 0
  server.events.on('request:start', ({ request }) => {
    if (new URL(request.url).pathname === '/api/Shortlist') count += 1
  })
  return () => count
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('pagina inicial', () => {
  it('mostra a saudacao, a busca e as shortlists', async () => {
    // Act
    renderRoute('/')

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Olá, Ana.' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Nome do jogador' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: LIST })).toBeInTheDocument()
  })

  it('busca pelo campo da pagina', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    const field = await screen.findByRole('searchbox', { name: 'Nome do jogador' })

    // Act
    await user.type(field, 'silva')
    await user.click(within(screen.getByRole('main')).getByRole('button', { name: 'Buscar' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/busca'))
    expect(router.state.location.search).toEqual({ termo: 'silva' })
  })
})

describe('suas shortlists', () => {
  it('mostra tres linhas de espera enquanto as shortlists carregam', async () => {
    // Arrange
    server.use(shortlistsPending)

    // Act
    renderRoute('/')

    // Assert
    const placeholder = await screen.findByRole('status', { name: 'Carregando shortlists' })
    expect(within(placeholder).getAllByRole('listitem')).toHaveLength(3)
  })

  it('lista as quatro shortlists da Ana por nome, sem Ver todas', async () => {
    // Arrange
    server.use(shortlistsList)

    // Act
    renderRoute('/')

    // Assert
    const list = await screen.findByRole('list', { name: LIST })
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Atacantes25 de 25 alvos · €400M',
      'Conflito2 de 25 alvos · €9M',
      'Laterais 20274 de 25 alvos · €47M',
      'Meias para janeiro0 de 25 alvos · Sem alvos',
    ])
    expect(screen.queryByRole('link', { name: 'Ver todas as shortlists' })).not.toBeInTheDocument()
  })

  it('abre a shortlist pela linha', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    const list = await screen.findByRole('list', { name: LIST })

    // Act
    await user.click(within(list).getByRole('link', { name: /Laterais 2027/ }))

    // Assert
    await screen.findByRole('heading', { name: 'Laterais 2027' })
    expect(router.state.location.pathname).toBe(`/shortlists/${SHORTLIST_IDS.laterais}`)
  })

  it('mostra so cinco quando ha mais e leva Ver todas a /shortlists', async () => {
    // Arrange
    const user = userEvent.setup()
    server.use(shortlistsMoreThanFive)
    const { router } = renderRoute('/')
    const list = await screen.findByRole('list', { name: LIST })

    // Act
    const names = within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    await user.click(screen.getByRole('link', { name: 'Ver todas as shortlists' }))

    // Assert
    expect(names).toHaveLength(5)
    expect(names.join(' ')).not.toContain('Zagueiros sub-23')
    await waitFor(() => expect(router.state.location.pathname).toBe('/shortlists'))
  })

  it('convida a criar a primeira shortlist quando nao ha nenhuma', async () => {
    // Arrange
    const user = userEvent.setup()
    server.use(shortlistsEmpty)
    const { router } = renderRoute('/')

    // Act
    await screen.findByText('Você ainda não tem shortlists.')
    await user.click(screen.getByRole('link', { name: 'Criar shortlist' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/shortlists'))
  })

  it('mostra o erro no cartao e a busca continua funcionando', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    server.use(shortlistsUnknownError)
    const { router } = renderRoute('/')

    const alert = await screen.findByRole('alert')
    const message = alert.textContent
    const retry = within(alert).queryByRole('button', { name: 'Tentar de novo' })

    // Act
    await user.type(screen.getByRole('searchbox', { name: 'Nome do jogador' }), 'silva{Enter}')

    // Assert
    expect(message).toContain('Não foi possível concluir agora.')
    expect(retry).not.toBeNull()
    await waitFor(() => expect(router.state.location.pathname).toBe('/busca'))
  })

  it('pede as shortlists de novo pelo Tentar de novo quando a fonte esta fora', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    server.use(shortlistsSourceDown)
    const requests = shortlistsRequests()
    renderRoute('/')
    const alert = await screen.findByRole('alert')
    const before = requests()
    server.use(shortlistsList)

    // Act
    await user.click(within(alert).getByRole('button', { name: 'Tentar de novo' }))

    // Assert
    expect(await screen.findByRole('list', { name: LIST })).toBeInTheDocument()
    expect(requests()).toBeGreaterThan(before)
  })
})
