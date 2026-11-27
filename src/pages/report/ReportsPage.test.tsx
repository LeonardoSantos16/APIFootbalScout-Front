import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { REPORT_IDS } from '../../mocks/fixtures/reports'
import { reportsList, reportsPending } from '../../mocks/handlers/reports'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const BRASILEIRAO_2025 = 'competicao=325&temporada=72034&contexto=Clube'
const tab = (playerId: number, search = '') => `/jogadores/${playerId}/relatorios${search ? `?${search}` : ''}`

const requests = (fragment: string) => {
  const urls: URL[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname.includes(fragment)) urls.push(url)
  })
  return urls
}

const group = (label: string) => screen.getByRole('list', { name: label })

afterEach(() => {
  vi.restoreAllMocks()
  server.events.removeAllListeners()
})

describe('aba Relatórios', () => {
  it('e a quinta aba e fica selecionada sem pedir o perfil de novo', async () => {
    // Arrange
    const profiles = requests('/profile')

    // Act
    renderRoute(tab(1001))

    // Assert
    await screen.findByText('Observado em 20/11/2026')
    const tabs = screen.getByRole('navigation', { name: 'Abas do jogador' })
    const links = within(tabs).getAllByRole('link')
    const names = ['Perfil', 'Métricas', 'Comparação', 'Acompanhamento', 'Relatórios']
    links.forEach((link, index) => expect(link).toHaveAccessibleName(names[index]))
    expect(links).toHaveLength(names.length)
    expect(within(tabs).getByRole('link', { name: 'Relatórios' })).toHaveAttribute('aria-current', 'page')
    expect(profiles).toHaveLength(1)
  })

  it('poe o nome do jogador no titulo da aba do navegador', async () => {
    // Act
    renderRoute(tab(1001))

    // Assert
    await waitFor(() => expect(document.title).toBe('Relatórios · Rafael Montes'))
  })

  it('mostra o grupo mais recente primeiro e a cadeia com o status de cada relatorio', async () => {
    // Act
    renderRoute(tab(1001))

    // Assert
    await screen.findByText('Observado em 20/11/2026')
    const groups = screen.getAllByRole('list').filter((list) => list.getAttribute('aria-label')?.startsWith('Relatório'))
    expect(groups.map((list) => list.getAttribute('aria-label'))).toEqual([
      'Relatório observado em 20/11/2026',
      'Relatório observado em 02/11/2026',
    ])
    const chain = group('Relatório observado em 02/11/2026')
    const rows = within(chain).getAllByRole('link')
    expect(rows[0]).toHaveTextContent('Observado em 02/11/2026')
    expect(rows[0]).toHaveTextContent('6,5 de 10 · Monitorar')
    expect(rows[0]).toHaveTextContent('Corrigido pela correção de 05/11/2026')
    expect(rows[0]).toHaveTextContent('Finalizado')
    expect(rows[1]).toHaveTextContent('Correção de 05/11/2026')
    expect(rows[1]).toHaveTextContent('Vigente')
    expect(rows[2]).toHaveTextContent('Correção de 12/11/2026')
    expect(rows[2]).toHaveTextContent('Rascunho')
    expect(rows[2]).toHaveTextContent('Continuar')
  })

  it('leva cada linha ao seu relatorio', async () => {
    // Act
    renderRoute(tab(1001))

    // Assert
    const loose = await screen.findByRole('link', { name: /Observado em 20\/11\/2026/ })
    expect(loose).toHaveAttribute('href', `/jogadores/1001/relatorios/${REPORT_IDS.looseDraft}`)
  })

  it('mostra o estado vazio com Escrever relatorio', async () => {
    // Act
    renderRoute(tab(1003))

    // Assert
    expect(await screen.findByText('Nenhum relatório sobre este jogador.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Escrever relatório' })).toHaveAttribute(
      'href',
      '/jogadores/1003/relatorios/novo',
    )
  })

  it('mostra o erro da lista e tenta de novo', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const user = userEvent.setup()
    renderRoute(tab(1007))
    await screen.findByText('Não foi possível concluir agora.')
    expect(screen.getByRole('link', { name: 'Escrever relatório' })).toBeInTheDocument()
    server.use(reportsList)

    // Act
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    // Assert
    expect(await screen.findByText('Nenhum relatório sobre este jogador.')).toBeInTheDocument()
  })

  it('mostra o esqueleto com Escrever relatorio habilitado enquanto a lista nao chega', async () => {
    // Arrange
    server.use(reportsPending)

    // Act
    renderRoute(tab(1001))

    // Assert
    expect(await screen.findByRole('status', { name: 'Carregando relatórios' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Escrever relatório' })).toBeInTheDocument()
  })

  it('nao mostra o seletor de recorte', async () => {
    // Act
    renderRoute(tab(1001, BRASILEIRAO_2025))

    // Assert
    await screen.findByText('Observado em 20/11/2026')
    expect(screen.queryByLabelText('Competição e temporada')).not.toBeInTheDocument()
  })

  it('mantem o recorte e o segundo jogador ao voltar para a comparacao', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = renderRoute(`/jogadores/1001/comparacao?${BRASILEIRAO_2025}&com=1006`)
    await user.click(await screen.findByRole('link', { name: 'Relatórios' }))
    await screen.findByText('Observado em 20/11/2026')

    // Act
    await user.click(screen.getByRole('link', { name: 'Comparação' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/comparacao'))
    expect(router.state.location.search).toMatchObject({ competicao: 325, temporada: 72034, contexto: 'Clube', com: 1006 })
  })

  it('marca a aba Relatórios dentro de um relatorio', async () => {
    // Act
    renderRoute(`/jogadores/1001/relatorios/${REPORT_IDS.looseDraft}`)

    // Assert
    expect(await screen.findByRole('link', { name: 'Relatórios' })).toHaveAttribute('aria-current', 'page')
  })
})
