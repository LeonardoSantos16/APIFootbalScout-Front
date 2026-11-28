import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const TITLE = 'Página não encontrada.'

const apiRequests = () => {
  const calls: string[] = []
  server.events.on('request:start', ({ request }) => {
    const { pathname } = new URL(request.url)
    if (pathname !== '/api/Auth/me') calls.push(`${request.method} ${pathname}`)
  })
  return calls
}

const banner = () => screen.getAllByRole('banner')[0]

describe('rota inexistente com sessao', () => {
  it('mostra a pagina dentro do topo do olheiro, sem nada marcado', async () => {
    // Act
    renderRoute('/xyz')

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
    expect(screen.getByText('O endereço não existe ou foi digitado errado.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir para o início' })).toBeInTheDocument()
    expect(within(banner()).getByRole('searchbox', { name: 'Buscar jogador' })).toBeInTheDocument()
    expect(within(banner()).getByRole('link', { name: 'Buscar' })).toBeInTheDocument()
    expect(within(banner()).getByRole('link', { name: 'Ana Ribeiro' })).not.toHaveAttribute('aria-current')
    expect(within(banner()).getByRole('link', { name: 'Shortlists' })).not.toHaveAttribute('aria-current')
  })

  it('leva ao inicio', async () => {
    // Arrange
    const { router } = renderRoute('/xyz')

    // Act
    await userEvent.click(await screen.findByRole('link', { name: 'Ir para o início' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('poe o nome do app no titulo da aba', async () => {
    // Act
    renderRoute('/xyz')

    // Assert
    await screen.findByRole('heading', { level: 1, name: TITLE })
    await waitFor(() => expect(document.title).toBe('Página não encontrada · APIFootballScout'))
  })
})

describe('rota inexistente sem sessao', () => {
  it('mostra a pagina com Entrar e so o nome do app no topo', async () => {
    // Act
    renderRoute('/xyz', { session: 'signed-out' })

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(banner()).toHaveTextContent('APIFootballScout')
    expect(within(banner()).queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('id invalido na URL', () => {
  it.each(['/jogadores/abc', '/jogadores/0/metricas', '/jogadores/-3'])(
    'mostra a pagina em %s sem pedir o perfil',
    async (url) => {
      // Arrange
      const calls = apiRequests()

      // Act
      renderRoute(url)

      // Assert
      expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
      expect(calls).toEqual([])
    },
  )

  it('mostra a pagina para uma shortlist que nao e uuid sem pedir a shortlist', async () => {
    // Arrange
    const calls = apiRequests()

    // Act
    renderRoute('/shortlists/123')

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
    expect(calls).toEqual([])
  })

  it('mostra a pagina para um relatorio que nao e uuid sem pedir o relatorio', async () => {
    // Arrange
    const calls = apiRequests()

    // Act
    renderRoute('/jogadores/1001/relatorios/abc')

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
    expect(calls).toEqual([])
  })
})
