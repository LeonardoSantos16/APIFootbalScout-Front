import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SHORTLIST_IDS } from '../../mocks/fixtures/shortlists'
import { profilePending } from '../../mocks/handlers/profile'
import {
  moveTargetOutOfOrder,
  moveTargetUnknownError,
  removeTargetNotFound,
  shortlistPending,
  shortlistUnknownError,
  writePending,
} from '../../mocks/handlers/shortlists'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const page = (id: string) => `/shortlists/${id}`
const ROW_HEIGHT = 64

const requests = (method: string, fragment: string) => {
  const calls: Request[] = []
  server.events.on('request:start', ({ request }) => {
    if (request.method === method && new URL(request.url).pathname.includes(fragment)) calls.push(request.clone())
  })
  return calls
}

const targets = () => within(screen.getByRole('list', { name: 'Alvos em ordem de prioridade' })).getAllByRole('listitem')

const rowOf = (text: string) => {
  const row = targets().find((item) => within(item).queryByText(text))
  if (!row) throw new Error(`linha ${text} nao encontrada`)
  return row
}

const openLaterais = async () => {
  renderRoute(page(SHORTLIST_IDS.laterais))
  await screen.findByRole('link', { name: 'Diego Albuquerque' })
}

const layoutRows = () => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const item = this.closest('li')
    const index = item?.parentElement ? Array.from(item.parentElement.children).indexOf(item) : 0
    const top = index * ROW_HEIGHT
    return { x: 0, y: top, top, left: 0, right: 600, bottom: top + ROW_HEIGHT, width: 600, height: ROW_HEIGHT, toJSON: () => ({}) }
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  server.events.removeAllListeners()
})

describe('shortlist: leitura', () => {
  it('mostra o cabecalho com os valores da resposta', async () => {
    // Act
    await openLaterais()

    // Assert
    expect(screen.getByRole('heading', { name: 'Laterais 2027' })).toBeInTheDocument()
    const values = screen.getAllByRole('definition').map((value) => value.textContent)
    const labels = screen.getAllByRole('term').map((label) => label.textContent)
    expect(labels).toEqual(['Alvos', 'Custo total', 'Moeda da lista'])
    expect(values).toEqual(['4 de 25', '€47M', 'EUR'])
    await waitFor(() => expect(document.title).toBe('Shortlist · Laterais 2027'))
  })

  it('mostra os alvos em ordem com o perfil e o custo', async () => {
    // Act
    await openLaterais()

    // Assert
    const rows = targets()
    expect(rows).toHaveLength(4)
    expect(rows[0]).toHaveTextContent('Prioridade 1')
    expect(rows[0]).toHaveTextContent('Miguel Torres')
    expect(rows[0]).toHaveTextContent('Defesa, Atlético Serrano')
    expect(rows[0]).toHaveTextContent('€8M')
    expect(rows[0]).toHaveTextContent('Custo estimado')
    expect(rows[1]).toHaveTextContent('Rafael Montes')
    expect(rows[1]).toHaveTextContent('€12,5M')
    expect(rows[2]).toHaveTextContent('Diego Albuquerque')
    expect(rows[2]).toHaveTextContent('€22M')
    expect(rows[3]).toHaveTextContent('€4,5M')
  })

  it('leva o nome ao perfil do jogador', async () => {
    // Arrange
    const user = userEvent.setup()
    renderRoute(page(SHORTLIST_IDS.laterais))

    // Act
    await user.click(await screen.findByRole('link', { name: 'Rafael Montes' }))

    // Assert
    expect(await screen.findByRole('heading', { name: 'Rafael Montes' })).toBeInTheDocument()
  })

  it('reaproveita o perfil que ja esta no cache', async () => {
    // Arrange
    const user = userEvent.setup()
    const profiles = requests('GET', '/api/Players/1001/profile')
    renderRoute('/jogadores/1001')
    await screen.findByRole('heading', { name: 'Rafael Montes' })

    // Act
    await user.click(screen.getByRole('link', { name: 'Shortlists' }))
    await user.click(await screen.findByRole('link', { name: /Laterais 2027/ }))

    // Assert
    expect(await screen.findByRole('link', { name: 'Rafael Montes' })).toBeInTheDocument()
    expect(profiles).toHaveLength(1)
  })

  it('mostra a linha sem perfil com nova tentativa no 502', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await openLaterais()

    // Assert
    const row = await waitFor(() => rowOf('Jogador #1009'))
    expect(within(row).getByText('Não foi possível carregar o perfil agora.')).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'Subir Jogador #1009' })).toBeEnabled()
    expect(within(row).getByRole('button', { name: 'Remover Jogador #1009' })).toBeEnabled()
  })

  it('diz que o perfil nao existe sem nova tentativa', async () => {
    // Act
    renderRoute(page(SHORTLIST_IDS.atacantes))

    // Assert
    const row = await waitFor(() => rowOf('Jogador #2017'))
    expect(await within(row).findByText('Perfil não encontrado.')).toBeInTheDocument()
    expect(within(row).queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
  })

  it('mostra custo e acoes enquanto o perfil carrega', async () => {
    // Arrange
    server.use(profilePending)

    // Act
    renderRoute(page(SHORTLIST_IDS.laterais))

    // Assert
    await waitFor(() => expect(targets()).toHaveLength(4))
    const row = targets()[1]
    expect(row).toHaveTextContent('€12,5M')
    expect(within(row).getByRole('button', { name: 'Remover Jogador #1001' })).toBeEnabled()
  })

  it('mostra a shortlist vazia com o caminho para a busca', async () => {
    // Act
    renderRoute(page(SHORTLIST_IDS.meias))

    // Assert
    expect(await screen.findByText('Nenhum alvo ainda. Adicione jogadores pelo perfil.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Buscar jogador' })).toHaveAttribute('href', '/busca')
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual(['0 de 25'])
  })

  it('avisa que a shortlist esta cheia', async () => {
    // Act
    renderRoute(page(SHORTLIST_IDS.atacantes))

    // Assert
    expect(await screen.findByText('A shortlist atingiu o limite de 25 alvos.')).toBeInTheDocument()
  })

  it('mostra o esqueleto enquanto carrega', async () => {
    // Arrange
    server.use(shortlistPending)

    // Act
    renderRoute(page(SHORTLIST_IDS.laterais))

    // Assert
    expect(await screen.findByRole('status', { name: 'Carregando shortlist' })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('Shortlist'))
  })

  it('diz que a shortlist nao foi encontrada', async () => {
    // Act
    renderRoute(page(SHORTLIST_IDS.missing))

    // Assert
    expect(await screen.findByText('Shortlist não encontrada.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar às shortlists' })).toHaveAttribute('href', '/shortlists')
  })

  it('mostra o erro generico sem nova tentativa', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(shortlistUnknownError)

    // Act
    renderRoute(page(SHORTLIST_IDS.laterais))

    // Assert
    expect(await screen.findByText('Não foi possível concluir agora.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
  })
})

describe('shortlist: escrita', () => {
  it('sobe um alvo com If-Match e mostra a ordem da resposta', async () => {
    // Arrange
    const user = userEvent.setup()
    const moves = requests('PUT', '/alvos/1001')
    await openLaterais()

    // Act
    await user.click(screen.getByRole('button', { name: 'Subir Rafael Montes' }))

    // Assert
    await waitFor(() => expect(targets()[0]).toHaveTextContent('Rafael Montes'))
    expect(targets()[1]).toHaveTextContent('Miguel Torres')
    expect(moves[0].headers.get('If-Match')).toBe('"1"')
    expect(await moves[0].json()).toEqual({ prioridade: 1 })
  })

  it('trava Subir na primeira e Descer na ultima', async () => {
    // Act
    await openLaterais()

    // Assert
    expect(screen.getByRole('button', { name: 'Subir Miguel Torres' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Descer Jogador #1009' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Descer Miguel Torres' })).toBeEnabled()
  })

  it('arrasta pelo teclado com anuncios e um pedido so', async () => {
    // Arrange
    const user = userEvent.setup()
    const moves = requests('PUT', '/alvos/1006')
    await openLaterais()
    layoutRows()
    const handle = screen.getByRole('button', { name: 'Arrastar Diego Albuquerque' })

    // Act
    handle.focus()
    await user.keyboard('[Space]')
    await screen.findByText('Diego Albuquerque pego, prioridade 3 de 4')
    await user.keyboard('[ArrowUp]')
    await user.keyboard('[ArrowUp]')
    await user.keyboard('[Space]')

    // Assert
    expect(await screen.findByText('solto na prioridade 1')).toBeInTheDocument()
    await waitFor(() => expect(moves).toHaveLength(1))
    expect(await moves[0].json()).toEqual({ prioridade: 1 })
    await waitFor(() => expect(targets()[0]).toHaveTextContent('Diego Albuquerque'))
  })

  it('cancela o arrasto com Esc sem pedir nada', async () => {
    // Arrange
    const user = userEvent.setup()
    const moves = requests('PUT', '/alvos/')
    await openLaterais()
    layoutRows()
    screen.getByRole('button', { name: 'Arrastar Diego Albuquerque' }).focus()

    // Act
    await user.keyboard('[Space]')
    await screen.findByText('Diego Albuquerque pego, prioridade 3 de 4')
    await user.keyboard('[Escape]')

    // Assert
    expect(await screen.findByText('cancelado')).toBeInTheDocument()
    expect(moves).toHaveLength(0)
  })

  it('marca a linha pendente e trava todas as acoes durante a escrita', async () => {
    // Arrange
    const user = userEvent.setup()
    server.use(...writePending)
    await openLaterais()

    // Act
    await user.click(screen.getByRole('button', { name: 'Subir Diego Albuquerque' }))

    // Assert
    expect(await within(rowOf('Diego Albuquerque')).findByText('Movendo para a prioridade 2…')).toBeInTheDocument()
    expect(targets()[2]).toHaveTextContent('Diego Albuquerque')
    for (const button of screen.getAllByRole('button', { name: /^(Subir|Descer|Remover|Arrastar) / })) {
      expect(button).toBeDisabled()
    }
  })

  it('remove sem confirmar e mostra a lista renumerada', async () => {
    // Arrange
    const user = userEvent.setup()
    await openLaterais()

    // Act
    await user.click(screen.getByRole('button', { name: 'Remover Miguel Torres' }))

    // Assert
    await waitFor(() => expect(targets()).toHaveLength(3))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(targets()[0]).toHaveTextContent('Prioridade 1')
    expect(targets()[0]).toHaveTextContent('Rafael Montes')
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual(['3 de 25', '€39M', 'EUR'])
  })

  it('mostra Removendo… enquanto remove', async () => {
    // Arrange
    const user = userEvent.setup()
    server.use(...writePending)
    await openLaterais()

    // Act
    await user.click(screen.getByRole('button', { name: 'Remover Miguel Torres' }))

    // Assert
    expect(await within(rowOf('Miguel Torres')).findByText('Removendo…')).toBeInTheDocument()
  })

  it.each([
    ['prioridade fora da ordem', moveTargetOutOfOrder, 'Prioridade fora da ordem da lista.'],
    ['erro desconhecido', moveTargetUnknownError, 'Não foi possível concluir agora.'],
  ])('mostra o aviso de %s e mantem a ordem', async (_, handler, text) => {
    // Arrange
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(handler)
    await openLaterais()

    // Act
    await user.click(screen.getByRole('button', { name: 'Subir Rafael Montes' }))

    // Assert
    expect(await screen.findByText(text)).toBeInTheDocument()
    expect(targets()[1]).toHaveTextContent('Rafael Montes')
  })

  it('mostra o aviso do alvo que ja saiu e some no proximo sucesso', async () => {
    // Arrange
    const user = userEvent.setup()
    server.use(removeTargetNotFound)
    await openLaterais()
    await user.click(screen.getByRole('button', { name: 'Remover Miguel Torres' }))
    await screen.findByText('Este jogador não está na shortlist.')
    server.resetHandlers()

    // Act
    await user.click(screen.getByRole('button', { name: 'Subir Rafael Montes' }))

    // Assert
    await waitFor(() => expect(targets()[0]).toHaveTextContent('Rafael Montes'))
    expect(screen.queryByText('Este jogador não está na shortlist.')).not.toBeInTheDocument()
  })

  it('le de novo e avisa quando outra aba mudou a shortlist', async () => {
    // Arrange
    const user = userEvent.setup()
    const reads = requests('GET', `/api/Shortlist/${SHORTLIST_IDS.conflito}`)
    renderRoute(page(SHORTLIST_IDS.conflito))
    await screen.findByRole('link', { name: 'Bruno Lacerda' })

    // Act
    await user.click(screen.getByRole('button', { name: 'Descer Bruno Lacerda' }))

    // Assert
    expect(
      await screen.findByText('Esta shortlist foi alterada em outra aba. A lista foi atualizada; refaça a mudança.'),
    ).toBeInTheDocument()
    expect(reads.length).toBeGreaterThanOrEqual(2)
    expect(targets()[0]).toHaveTextContent('Bruno Lacerda')
  })
})
