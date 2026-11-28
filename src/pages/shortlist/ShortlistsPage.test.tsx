import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SHORTLIST_IDS } from '../../mocks/fixtures/shortlists'
import {
  createShortlistPending,
  createShortlistUnknownError,
  shortlistsEmpty,
  shortlistsPending,
  shortlistsUnknownError,
} from '../../mocks/handlers/shortlists'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const writes = () => {
  const calls: Request[] = []
  server.events.on('request:start', ({ request }) => {
    if (request.method !== 'GET' && new URL(request.url).pathname.startsWith('/api/Shortlist')) calls.push(request.clone())
  })
  return calls
}

const topNavigation = () => screen.getByRole('navigation', { name: 'Principal' })

afterEach(() => {
  vi.restoreAllMocks()
  server.events.removeAllListeners()
})

describe('navegacao no topo', () => {
  it('leva Shortlists a /shortlists marcado como atual', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = renderRoute('/jogadores/1001')
    await screen.findByRole('heading', { name: 'Rafael Montes' })

    // Act
    await user.click(within(topNavigation()).getByRole('link', { name: 'Shortlists' }))

    // Assert
    await screen.findByRole('heading', { name: 'Shortlists' })
    expect(router.state.location.pathname).toBe('/shortlists')
    expect(within(topNavigation()).getByRole('link', { name: 'Shortlists' })).toHaveAttribute('aria-current', 'page')
  })

  it('marca Shortlists dentro de uma shortlist', async () => {
    // Act
    renderRoute(`/shortlists/${SHORTLIST_IDS.laterais}`)

    // Assert
    await screen.findByRole('heading', { name: 'Laterais 2027' })
    expect(within(topNavigation()).getByRole('link', { name: 'Shortlists' })).toHaveAttribute('aria-current', 'page')
  })

  it('nao marca link nenhum no perfil e deixa os outros como texto', async () => {
    // Act
    renderRoute('/jogadores/1001')

    // Assert
    await screen.findByRole('heading', { name: 'Rafael Montes' })
    const top = topNavigation()
    expect(within(top).getByRole('link', { name: 'Shortlists' })).not.toHaveAttribute('aria-current')
    expect(within(top).queryByRole('link', { name: 'Acompanhamentos' })).not.toBeInTheDocument()
    expect(within(top).queryByRole('link', { name: 'Relatórios' })).not.toBeInTheDocument()
    expect(within(top).getByText('Acompanhamentos')).toBeInTheDocument()
  })
})

describe('pagina Shortlists', () => {
  it('lista as shortlists da Ana em ordem alfabetica', async () => {
    // Act
    renderRoute('/shortlists')

    // Assert
    const list = await screen.findByRole('list', { name: 'Shortlists' })
    const rows = within(list).getAllByRole('link')
    expect(rows.map((row) => row.textContent)).toEqual([
      'Atacantes25 de 25 alvos · €400M',
      'Conflito2 de 25 alvos · €9M',
      'Laterais 20274 de 25 alvos · €47M',
      'Meias para janeiro0 de 25 alvos · Sem alvos',
    ])
    await waitFor(() => expect(document.title).toBe('Shortlists'))
  })

  it('abre a shortlist pela linha', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = renderRoute('/shortlists')
    const list = await screen.findByRole('list', { name: 'Shortlists' })

    // Act
    await user.click(within(list).getByRole('link', { name: /Laterais 2027/ }))

    // Assert
    await screen.findByRole('heading', { name: 'Laterais 2027' })
    expect(router.state.location.pathname).toBe(`/shortlists/${SHORTLIST_IDS.laterais}`)
  })

  it('mostra o esqueleto com o formulario ja usavel enquanto carrega', async () => {
    // Arrange
    server.use(shortlistsPending)

    // Act
    renderRoute('/shortlists')

    // Assert
    expect(await screen.findByRole('status', { name: 'Carregando shortlists' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nome da shortlist' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Criar shortlist' })).toBeEnabled()
  })

  it('diz quando nao ha shortlist', async () => {
    // Arrange
    server.use(shortlistsEmpty)

    // Act
    renderRoute('/shortlists')

    // Assert
    expect(await screen.findByText('Nenhuma shortlist ainda.')).toBeInTheDocument()
  })

  it('mostra o erro no lugar da lista', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(shortlistsUnknownError)

    // Act
    renderRoute('/shortlists')

    // Assert
    expect(await screen.findByText('Não foi possível concluir agora.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nome da shortlist' })).toBeEnabled()
  })
})

describe('criar shortlist', () => {
  it('recusa o nome em branco sem pedir nada', async () => {
    // Arrange
    const user = userEvent.setup()
    const calls = writes()
    renderRoute('/shortlists')
    await screen.findByRole('list', { name: 'Shortlists' })

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Nome da shortlist' }), '   ')
    await user.click(screen.getByRole('button', { name: 'Criar shortlist' }))

    // Assert
    expect(screen.getByText('Dê um nome à shortlist.')).toBeInTheDocument()
    expect(calls).toHaveLength(0)
  })

  it('cria com o nome limpo e abre a shortlist nova', async () => {
    // Arrange
    const user = userEvent.setup()
    const calls = writes()
    const { router } = renderRoute('/shortlists')
    await screen.findByRole('list', { name: 'Shortlists' })

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Nome da shortlist' }), '  Volantes 2027 ')
    await user.click(screen.getByRole('button', { name: 'Criar shortlist' }))

    // Assert
    expect(await screen.findByRole('heading', { name: 'Volantes 2027' })).toBeInTheDocument()
    expect(screen.getByText('0 de 25')).toBeInTheDocument()
    expect(router.state.location.pathname).toMatch(/^\/shortlists\/[0-9a-f-]{36}$/)
    expect(await calls[0].json()).toEqual({ nome: 'Volantes 2027' })
  })

  it('mostra Criando… e trava o campo enquanto envia', async () => {
    // Arrange
    const user = userEvent.setup()
    server.use(createShortlistPending)
    renderRoute('/shortlists')
    await screen.findByRole('list', { name: 'Shortlists' })

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Nome da shortlist' }), 'Base')
    await user.click(screen.getByRole('button', { name: 'Criar shortlist' }))

    // Assert
    expect(await screen.findByRole('button', { name: 'Criando…' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Nome da shortlist' })).toBeDisabled()
  })

  it('mantem o nome quando a criacao falha', async () => {
    // Arrange
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(createShortlistUnknownError)
    renderRoute('/shortlists')
    await screen.findByRole('list', { name: 'Shortlists' })

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Nome da shortlist' }), 'Base')
    await user.click(screen.getByRole('button', { name: 'Criar shortlist' }))

    // Assert
    expect(await screen.findByText('Não foi possível concluir agora.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nome da shortlist' })).toHaveValue('Base')
  })
})
