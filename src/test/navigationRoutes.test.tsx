import { QueryClient } from '@tanstack/react-query'
import { createMemoryHistory } from '@tanstack/react-router'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { readSession } from '../api/session'
import { SHORTLIST_IDS } from '../mocks/fixtures/shortlists'
import { createAppRouter } from '../router'
import { scrollKey } from '../utils/pageChange'
import { renderRoute } from './renderRoute'

const BRASILEIRAO_2025 = '?competicao=325&temporada=72034&contexto=Clube'

const banner = () => screen.getAllByRole('banner')[0]

const currentLinks = (container: HTMLElement) =>
  within(container)
    .queryAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')

const openMenu = async () => {
  await userEvent.click(within(banner()).getByRole('button', { name: 'Menu' }))
  return screen.findByRole('dialog', { name: 'Menu' })
}

describe('topo', () => {
  it('mostra o nome do app, a busca, Shortlists, o olheiro e Sair, sem Acompanhamentos nem Relatorios', async () => {
    // Act
    renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)

    // Assert
    await screen.findByRole('heading', { name: 'Rafael Montes' })
    const top = banner()
    expect(within(top).getByRole('link', { name: 'APIFootballScout' })).toBeInTheDocument()
    expect(within(top).getByRole('searchbox', { name: 'Buscar jogador' })).toBeInTheDocument()
    expect(within(top).getByRole('link', { name: 'Shortlists' })).toBeInTheDocument()
    expect(within(top).getByRole('link', { name: 'Ana Ribeiro' })).toBeInTheDocument()
    expect(within(top).getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    expect(top).not.toHaveTextContent('Acompanhamentos')
    expect(top).not.toHaveTextContent('Relatórios')
  })

  it('leva o nome do app ao inicio', async () => {
    // Arrange
    const { router } = renderRoute('/jogadores/1001')
    await screen.findByRole('heading', { name: 'Rafael Montes' })

    // Act
    await userEvent.click(within(banner()).getByRole('link', { name: 'APIFootballScout' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('marca o nome do olheiro em Conta', async () => {
    // Act
    renderRoute('/conta')

    // Assert
    await screen.findByRole('heading', { name: 'Conta' })
    expect(within(banner()).getByRole('link', { name: 'Ana Ribeiro' })).toHaveAttribute('aria-current', 'page')
  })

  it('nao marca nada no perfil', async () => {
    // Act
    renderRoute('/jogadores/1001')

    // Assert
    await screen.findByRole('heading', { name: 'Rafael Montes' })
    expect(currentLinks(banner())).toEqual([])
  })

  it('marca Shortlists dentro de uma shortlist', async () => {
    // Act
    renderRoute(`/shortlists/${SHORTLIST_IDS.laterais}`)

    // Assert
    await screen.findByRole('heading', { name: 'Laterais 2027' })
    expect(within(banner()).getByRole('link', { name: 'Shortlists' })).toHaveAttribute('aria-current', 'page')
  })

  it('mostra so o nome do app, sem link, em Entrar', async () => {
    // Act
    renderRoute('/entrar', { session: 'signed-out' })

    // Assert
    await screen.findByRole('heading', { name: 'Entrar' })
    expect(banner()).toHaveTextContent('APIFootballScout')
    expect(within(banner()).queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('pular para o conteudo', () => {
  it('e o primeiro Tab e leva o foco ao conteudo', async () => {
    // Arrange
    renderRoute('/jogadores/1001')
    await screen.findByRole('heading', { name: 'Rafael Montes' })

    // Act
    await userEvent.tab()
    const skip = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    const focusedFirst = document.activeElement === skip
    await userEvent.keyboard('{Enter}')

    // Assert
    expect(focusedFirst).toBe(true)
    expect(screen.getByRole('main')).toHaveFocus()
  })
})

describe('menu do celular', () => {
  it('mostra Inicio, Shortlists, o olheiro e Sair, com Inicio atual no inicio', async () => {
    // Arrange
    renderRoute('/')
    await screen.findByRole('heading', { name: 'Olá, Ana.' })

    // Act
    const menu = await openMenu()

    // Assert
    expect(within(menu).getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page')
    expect(within(menu).getByRole('link', { name: 'Shortlists' })).not.toHaveAttribute('aria-current')
    expect(within(menu).getByRole('link', { name: 'Ana Ribeiro Conta' })).toBeInTheDocument()
    expect(within(menu).getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('nao marca nada no perfil', async () => {
    // Arrange
    renderRoute('/jogadores/1001')
    await screen.findByRole('heading', { name: 'Rafael Montes' })

    // Act
    const menu = await openMenu()

    // Assert
    expect(currentLinks(menu)).toEqual([])
  })

  it('fecha ao seguir um link', async () => {
    // Arrange
    const { router } = renderRoute('/')
    await screen.findByRole('heading', { name: 'Olá, Ana.' })
    const menu = await openMenu()

    // Act
    await userEvent.click(within(menu).getByRole('link', { name: 'Shortlists' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/shortlists'))
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
  })

  it('fecha com Esc e devolve o foco ao Menu', async () => {
    // Arrange
    renderRoute('/')
    await screen.findByRole('heading', { name: 'Olá, Ana.' })
    await openMenu()

    // Act
    await userEvent.keyboard('{Escape}')

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument())
    expect(within(banner()).getByRole('button', { name: 'Menu' })).toHaveFocus()
  })

  it('encerra a sessao pelo Sair do menu', async () => {
    // Arrange
    const { router } = renderRoute('/')
    await screen.findByRole('heading', { name: 'Olá, Ana.' })
    const menu = await openMenu()

    // Act
    await userEvent.click(within(menu).getByRole('button', { name: 'Sair' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/entrar'))
    expect(readSession()).toBeNull()
  })
})

describe('foco na troca de pagina', () => {
  it('vai para o titulo do perfil aberto pela busca', async () => {
    // Arrange
    renderRoute('/busca?termo=rafael')

    // Act
    await userEvent.click(await screen.findByRole('link', { name: /Rafael Montes/ }))

    // Assert
    const heading = await screen.findByRole('heading', { level: 1, name: 'Rafael Montes' })
    await waitFor(() => expect(heading).toHaveFocus())
  })

  it('fica na aba ao trocar de aba do mesmo jogador', async () => {
    // Arrange
    const { router } = renderRoute('/jogadores/1001')
    await screen.findByRole('heading', { name: 'Rafael Montes' })

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Métricas' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/metricas'))
    await screen.findByText('0,35')
    expect(screen.getByRole('link', { name: 'Métricas' })).toHaveFocus()
  })

  it('fica no seletor ao trocar o recorte', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = renderRoute(`/jogadores/1001/metricas${BRASILEIRAO_2025}`)
    const select = await screen.findByRole('combobox', { name: 'Competição e temporada' })
    await screen.findByText('0,35')

    // Act
    await user.selectOptions(select, 'Seleção · Eliminatórias Sul-Americanas · 2025')

    // Assert
    await waitFor(() => expect(router.state.location.search).toMatchObject({ contexto: 'Selecao' }))
    expect(screen.getByRole('combobox', { name: 'Competição e temporada' })).toHaveFocus()
  })

  it('fica no campo da busca aberta pelo Buscar do topo', async () => {
    // Arrange
    const { router } = renderRoute('/jogadores/1001')
    await screen.findByRole('heading', { name: 'Rafael Montes' })

    // Act
    await userEvent.click(within(banner()).getByRole('link', { name: 'Buscar' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/busca'))
    const field = await screen.findByRole('searchbox', { name: 'Nome do jogador' })
    await waitFor(() => expect(field).toHaveFocus())
  })

  it('nao se move no primeiro carregamento', async () => {
    // Act
    renderRoute('/')

    // Assert
    await screen.findByRole('heading', { name: 'Olá, Ana.' })
    expect(document.body).toHaveFocus()
  })
})

describe('rolagem na troca de pagina', () => {
  it('restaura a rolagem com a chave das paginas', () => {
    // Act
    const router = createAppRouter({ queryClient: new QueryClient(), history: createMemoryHistory() })
    const key = router.options.getScrollRestorationKey?.({ ...router.state.location, pathname: '/jogadores/1001/metricas' })

    // Assert
    expect(router.options.scrollRestoration).toBe(true)
    expect(key).toBe(scrollKey('/jogadores/1001/metricas'))
  })
})
