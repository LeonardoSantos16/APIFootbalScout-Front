import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildFullProfile } from '../../mocks/fixtures/profiles'
import { profilePending } from '../../mocks/handlers/profile'
import {
  addTargetCurrency,
  addTargetDuplicate,
  addTargetLimit,
  addTargetUnknownError,
  shortlistsEmpty,
  shortlistsPending,
  writePending,
} from '../../mocks/handlers/shortlists'
import { http } from '../../mocks/http'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const OPEN = 'Adicionar à shortlist'
const BRASILEIRAO_2025 = '?competicao=325&temporada=72034&contexto=Clube'

const shortlistRequests = (method: string) => {
  const calls: Request[] = []
  server.events.on('request:start', ({ request }) => {
    if (request.method === method && new URL(request.url).pathname.startsWith('/api/Shortlist')) calls.push(request.clone())
  })
  return calls
}

const openDialog = async (user: ReturnType<typeof userEvent.setup>, url = '/jogadores/1001') => {
  renderRoute(url)
  await user.click(await screen.findByRole('button', { name: OPEN }))
  const dialog = await screen.findByRole('dialog', { name: OPEN })
  await within(dialog).findByRole('combobox', { name: 'Shortlist' })
  return dialog
}

const chooseShortlist = async (user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement, name: string) => {
  const select = within(dialog).getByRole('combobox', { name: 'Shortlist' })
  const option = within(select).getByRole('option', { name: new RegExp(`^${name} — `) })
  await user.selectOptions(select, option)
}

afterEach(() => {
  vi.restoreAllMocks()
  server.events.removeAllListeners()
})

describe('botao Adicionar à shortlist', () => {
  it.each([
    ['Perfil', '/jogadores/1001'],
    ['Métricas', `/jogadores/1001/metricas${BRASILEIRAO_2025}`],
    ['Comparação', `/jogadores/1001/comparacao${BRASILEIRAO_2025}`],
    ['Acompanhamento', '/jogadores/1001/acompanhamento'],
    ['Relatórios', '/jogadores/1001/relatorios'],
  ])('aparece na faixa da aba %s', async (_, url) => {
    // Act
    renderRoute(url)

    // Assert
    expect(await screen.findByRole('button', { name: OPEN })).toBeInTheDocument()
  })

  it('nao aparece enquanto o perfil carrega', async () => {
    // Arrange
    server.use(profilePending)

    // Act
    renderRoute('/jogadores/1001')

    // Assert
    await screen.findByRole('navigation', { name: 'Abas do jogador' })
    expect(screen.queryByRole('button', { name: OPEN })).not.toBeInTheDocument()
  })

  it('nao pede as shortlists antes do clique', async () => {
    // Arrange
    const reads = shortlistRequests('GET')

    // Act
    renderRoute('/jogadores/1001')

    // Assert
    await screen.findByRole('button', { name: OPEN })
    expect(reads).toHaveLength(0)
  })
})

describe('dialogo Adicionar à shortlist', () => {
  it('lista as shortlists com o motivo das que nao aceitam o jogador', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    const dialog = await openDialog(user)

    // Assert
    expect(within(dialog).getByText('Rafael Montes')).toBeInTheDocument()
    const select = within(dialog).getByRole('combobox', { name: 'Shortlist' })
    expect(within(select).getByRole('option', { name: 'Atacantes — Cheia (25 de 25)' })).toBeDisabled()
    expect(within(select).getByRole('option', { name: 'Laterais 2027 — Já está nesta shortlist' })).toBeDisabled()
    expect(select).toHaveDisplayValue('Conflito — 2 de 25 alvos')
  })

  it('mostra os campos em esqueleto enquanto as shortlists carregam', async () => {
    // Arrange
    const user = userEvent.setup()
    server.use(shortlistsPending)
    renderRoute('/jogadores/1001')

    // Act
    await user.click(await screen.findByRole('button', { name: OPEN }))

    // Assert
    expect(await screen.findByRole('status', { name: 'Carregando shortlists' })).toBeInTheDocument()
  })

  it('preenche o custo com o valor de mercado e trava a moeda da lista', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    const dialog = await openDialog(user)

    // Assert
    expect(within(dialog).getByRole('textbox', { name: 'Custo estimado' })).toHaveValue('12,5')
    expect(within(dialog).getByLabelText('Moeda EUR, definida pela lista')).toBeInTheDocument()
    expect(within(dialog).getByText('A moeda da lista é EUR.')).toBeInTheDocument()
    expect(within(dialog).getByRole('combobox', { name: 'Prioridade' })).toHaveDisplayValue('3 — no fim')
  })

  it('deixa o custo vazio quando o valor de mercado esta em outra moeda', async () => {
    // Arrange
    const user = userEvent.setup()
    const profile = buildFullProfile(1001)
    server.use(
      http.get('/api/Players/{id}/profile', ({ response }) =>
        response(200).json({
          ...profile,
          details: profile.details && { ...profile.details, proposedMarketValueRaw: { value: 60_000_000, currency: 'BRL' } },
        }),
      ),
    )

    // Act
    const dialog = await openDialog(user)

    // Assert
    expect(within(dialog).getByRole('textbox', { name: 'Custo estimado' })).toHaveValue('')
  })

  it('libera a moeda e oferece so o topo numa shortlist vazia', async () => {
    // Arrange
    const user = userEvent.setup()
    const dialog = await openDialog(user)

    // Act
    await chooseShortlist(user, dialog, 'Meias para janeiro')

    // Assert
    const currency = within(dialog).getByRole('combobox', { name: 'Moeda' })
    expect(within(currency).getAllByRole('option').map((option) => option.textContent)).toEqual(['EUR', 'BRL', 'USD', 'GBP'])
    expect(within(dialog).getByText('O primeiro alvo define a moeda da lista.')).toBeInTheDocument()
    const priority = within(dialog).getByRole('combobox', { name: 'Prioridade' })
    expect(within(priority).getAllByRole('option').map((option) => option.textContent)).toEqual(['1 — no topo'])
  })

  it.each([
    ['0', 'Informe um custo maior que zero.'],
    ['12,555', 'Use no máximo duas casas decimais.'],
  ])('recusa o custo "%s" sem enviar', async (cost, message) => {
    // Arrange
    const user = userEvent.setup()
    const writes = shortlistRequests('POST')
    const dialog = await openDialog(user)
    const field = within(dialog).getByRole('textbox', { name: 'Custo estimado' })

    // Act
    await user.clear(field)
    await user.type(field, cost)
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }))

    // Assert
    expect(within(dialog).getByText(message)).toBeInTheDocument()
    expect(writes).toHaveLength(0)
  })

  it('adiciona o jogador e leva para a shortlist', async () => {
    // Arrange
    const user = userEvent.setup()
    const writes = shortlistRequests('POST')
    const dialog = await openDialog(user)
    await chooseShortlist(user, dialog, 'Meias para janeiro')

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }))

    // Assert
    expect(await within(dialog).findByText('Adicionado a Meias para janeiro, na prioridade 1.')).toBeInTheDocument()
    expect(writes[0].headers.get('If-Match')).toBe('"1"')
    expect(await writes[0].json()).toEqual({
      jogadorId: 1001,
      prioridade: 1,
      custoEstimado: { quantiaEmCentavos: 1_250_000_000, moeda: 'EUR' },
    })
    await user.click(within(dialog).getByRole('link', { name: 'Ver shortlist' }))
    expect(await screen.findByRole('heading', { name: 'Meias para janeiro' })).toBeInTheDocument()
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual(['1 de 25', '€12,5M', 'EUR'])
    expect(await screen.findByRole('link', { name: 'Rafael Montes' })).toBeInTheDocument()
  })

  it('mostra Adicionando… enquanto envia', async () => {
    // Arrange
    const user = userEvent.setup()
    server.use(...writePending)
    const dialog = await openDialog(user)
    await chooseShortlist(user, dialog, 'Meias para janeiro')

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }))

    // Assert
    expect(await within(dialog).findByRole('button', { name: 'Adicionando…' })).toBeDisabled()
    expect(within(dialog).getByRole('textbox', { name: 'Custo estimado' })).toBeDisabled()
  })

  it.each([
    ['jogador ja na lista', addTargetDuplicate, 'Este jogador já está na shortlist.'],
    ['limite atingido', addTargetLimit, 'A shortlist atingiu o limite de 25 alvos.'],
    ['moeda divergente', addTargetCurrency, 'Todos os custos da shortlist precisam usar a mesma moeda.'],
    ['erro desconhecido', addTargetUnknownError, 'Não foi possível concluir agora.'],
  ])('mostra a recusa de %s no dialogo', async (_, handler, text) => {
    // Arrange
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(handler)
    const dialog = await openDialog(user)
    await chooseShortlist(user, dialog, 'Meias para janeiro')

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }))

    // Assert
    expect(await within(dialog).findByText(text)).toBeInTheDocument()
    expect(within(dialog).getByRole('textbox', { name: 'Custo estimado' })).toHaveValue('12,5')
  })

  it('le as shortlists de novo e mantem o custo no conflito', async () => {
    // Arrange
    const user = userEvent.setup()
    const reads = shortlistRequests('GET')
    const dialog = await openDialog(user)
    const field = within(dialog).getByRole('textbox', { name: 'Custo estimado' })
    await user.clear(field)
    await user.type(field, '9')

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }))

    // Assert
    expect(
      await within(dialog).findByText('Esta shortlist foi alterada em outra aba. Confira e tente de novo.'),
    ).toBeInTheDocument()
    expect(reads.filter((request) => new URL(request.url).pathname === '/api/Shortlist').length).toBeGreaterThanOrEqual(2)
    expect(field).toHaveValue('9')
  })

  it('cria a primeira shortlist dentro do dialogo e segue com ela', async () => {
    // Arrange
    const user = userEvent.setup()
    server.use(shortlistsEmpty)
    renderRoute('/jogadores/1001')
    await user.click(await screen.findByRole('button', { name: OPEN }))
    const dialog = await screen.findByRole('dialog', { name: OPEN })
    await within(dialog).findByText('Você ainda não tem shortlist. Crie uma para adicionar Rafael Montes.')

    // Act
    await user.type(within(dialog).getByRole('textbox', { name: 'Nome da shortlist' }), 'Volantes')
    await user.click(within(dialog).getByRole('button', { name: 'Criar shortlist' }))

    // Assert
    const select = await within(dialog).findByRole('combobox', { name: 'Shortlist' })
    await waitFor(() => expect(select).toHaveDisplayValue('Volantes — 0 de 25 alvos'))
    expect(within(dialog).getByRole('combobox', { name: 'Prioridade' })).toHaveDisplayValue('1 — no topo')
  })
})

describe('fechar o dialogo', () => {
  it('fecha pelo Cancelar sem enviar nada', async () => {
    // Arrange
    const user = userEvent.setup()
    const writes = shortlistRequests('POST')
    const dialog = await openDialog(user)

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(writes).toHaveLength(0)
  })
})
