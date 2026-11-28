import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { REPORT_IDS, looseDraftReport } from '../../mocks/fixtures/reports'
import {
  REPORT_ITEM,
  createReportFutureDate,
  editReportAlreadyFinalized,
  editReportPending,
  editReportUnknownError,
  finalizeReportConclusionMissing,
  finalizeReportMinimumContent,
  reportPending,
} from '../../mocks/handlers/reports'
import { http } from '../../mocks/http'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

interface Write {
  method: string
  path: string
  ifMatch: string | null
  body: Promise<unknown>
}

const writes = () => {
  const list: Write[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (request.method === 'GET' || !url.pathname.startsWith('/api/Relatorio')) return
    list.push({
      method: request.method,
      path: url.pathname,
      ifMatch: request.headers.get('If-Match'),
      body: request
        .clone()
        .text()
        .then((text) => (text ? JSON.parse(text) : undefined)),
    })
  })
  return list
}

const report = (id: string) => `/jogadores/1001/relatorios/${id}`
const NEW = '/jogadores/1001/relatorios/novo'

const narrative = () => screen.getByLabelText('Relato')
const saveButton = () => screen.getByRole('button', { name: 'Salvar rascunho' })
const SLOW_FLOW_MS = 10_000

const finalizeButton = () => screen.getByRole('button', { name: 'Finalizar relatório' })
const pointGroup = (label: string) => screen.getByRole('group', { name: label })

const openLooseDraft = async () => {
  const result = renderRoute(report(REPORT_IDS.looseDraft))
  await screen.findByDisplayValue(looseDraftReport().texto)
  return result
}

const completePoints = async (user: ReturnType<typeof userEvent.setup>) => {
  const positive = pointGroup('Pontos positivos')
  await user.click(within(positive).getByRole('button', { name: 'Adicionar ponto' }))
  await user.type(within(positive).getByLabelText('Pontos positivos, ponto 2'), 'Leitura')
  const negative = pointGroup('Pontos negativos')
  await user.click(within(negative).getByRole('button', { name: 'Adicionar ponto' }))
  await user.type(within(negative).getByLabelText('Pontos negativos, ponto 1'), 'Cai')
  await user.click(within(negative).getByRole('button', { name: 'Adicionar ponto' }))
  await user.type(within(negative).getByLabelText('Pontos negativos, ponto 2'), 'Aéreo')
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 24, 15, 0))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  server.events.removeAllListeners()
})

describe('editor do relatorio', () => {
  it('abre o relatorio novo com a data de hoje sem criar nada', async () => {
    // Arrange
    const sent = writes()
    const user = userEvent.setup()
    renderRoute('/jogadores/1001/relatorios')

    // Act
    await user.click(await screen.findByRole('link', { name: 'Escrever relatório' }))

    // Assert
    expect(await screen.findByLabelText('Data da observação')).toHaveValue('2026-11-24')
    expect(screen.getByLabelText('Data da observação')).toHaveAttribute('max', '2026-11-24')
    expect(narrative()).toHaveValue('')
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
    expect(sent).toHaveLength(0)
  }, SLOW_FLOW_MS)

  it('pede o relato sem mandar nada', async () => {
    // Arrange
    const sent = writes()
    const user = userEvent.setup()
    renderRoute(NEW)
    await screen.findByLabelText('Relato')

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByText('Escreva o relato.')).toBeInTheDocument()
    expect(sent).toHaveLength(0)
  })

  it.each([
    ['11', 'A nota deve estar entre 0 e 10.'],
    ['7,25', 'A nota aceita no máximo uma casa decimal.'],
  ])('recusa a nota %s', async (rating, message) => {
    // Arrange
    const sent = writes()
    const user = userEvent.setup()
    await openLooseDraft()
    await user.clear(screen.getByLabelText('Nota'))
    await user.type(screen.getByLabelText('Nota'), rating)

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(sent).toHaveLength(0)
  })

  it('cria o rascunho, salva o resto com a versao recebida e troca o endereco', async () => {
    // Arrange
    const sent = writes()
    const user = userEvent.setup()
    const { router } = renderRoute('/jogadores/1001/relatorios')
    await user.click(await screen.findByRole('link', { name: 'Escrever relatório' }))
    await user.type(await screen.findByLabelText('Relato'), 'Jogo contra o Vila Nova.')
    await user.type(screen.getByLabelText('Nota'), '7,5')
    await user.click(screen.getByRole('radio', { name: 'Monitorar' }))
    const positive = pointGroup('Pontos positivos')
    await user.click(within(positive).getByRole('button', { name: 'Adicionar ponto' }))
    await user.type(within(positive).getByLabelText('Pontos positivos, ponto 1'), '  Fôlego até o fim ')
    await user.click(within(positive).getByRole('button', { name: 'Adicionar ponto' }))
    const historyLength = router.history.length

    // Act
    await user.click(saveButton())

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/jogadores\/1001\/relatorios\/[0-9a-f-]{36}$/))
    expect(sent.map((write) => `${write.method} ${write.path.replace(/[0-9a-f-]{36}/, '<id>')}`)).toEqual([
      'POST /api/Relatorio',
      'PUT /api/Relatorio/<id>',
    ])
    expect(await sent[0].body).toMatchObject({ jogadorId: 1001, texto: 'Jogo contra o Vila Nova.' })
    expect(sent[1].ifMatch).toBe('"1"')
    expect(await sent[1].body).toEqual({ nota: 7.5, parecer: 'Monitorar', pontosPositivos: ['Fôlego até o fim'] })
    expect(router.history.length).toBe(historyLength)
    expect(await screen.findByText('A data da observação não muda depois de salvar.')).toBeInTheDocument()
  }, SLOW_FLOW_MS)

  it('desabilita campos e botoes enquanto salva', async () => {
    // Arrange
    server.use(editReportPending)
    const user = userEvent.setup()
    await openLooseDraft()
    await user.type(narrative(), ' Mais um detalhe.')

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByRole('button', { name: 'Salvando…' })).toBeDisabled()
    expect(narrative()).toBeDisabled()
    expect(finalizeButton()).toBeDisabled()
  })

  it('avisa as alteracoes nao salvas e some quando o texto volta', async () => {
    // Arrange
    const user = userEvent.setup()
    await openLooseDraft()
    expect(screen.queryByText('Alterações não salvas')).not.toBeInTheDocument()

    // Act
    await user.type(narrative(), '!')

    // Assert
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
    await user.type(narrative(), '{Backspace}')
    expect(screen.queryByText('Alterações não salvas')).not.toBeInTheDocument()
  })

  it('mostra a data do rascunho salvo como texto', async () => {
    // Act
    await openLooseDraft()

    // Assert
    expect(screen.getByText('20/11/2026')).toBeInTheDocument()
    expect(screen.getByText('A data da observação não muda depois de salvar.')).toBeInTheDocument()
  })

  it('pede a nota quando o olheiro apaga a nota salva', async () => {
    // Arrange
    const sent = writes()
    const user = userEvent.setup()
    await openLooseDraft()
    await user.clear(screen.getByLabelText('Nota'))

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByText('Informe a nota.')).toBeInTheDocument()
    expect(sent).toHaveLength(0)
  })

  it('mostra a falha ao salvar junto aos botoes e mantem o texto', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    server.use(editReportUnknownError)
    const user = userEvent.setup()
    await openLooseDraft()
    await user.type(narrative(), ' Mais um detalhe.')

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByText('Não foi possível concluir agora.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
    expect(narrative()).toHaveValue(`${looseDraftReport().texto} Mais um detalhe.`)
  })

  it('fica no endereco novo quando o rascunho foi criado e o resto falhou', async () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    server.use(editReportUnknownError)
    const sent = writes()
    const user = userEvent.setup()
    const { router } = renderRoute(NEW)
    await user.type(await screen.findByLabelText('Relato'), 'Jogo contra o Vila Nova.')
    await user.type(screen.getByLabelText('Nota'), '8')

    // Act
    await user.click(saveButton())

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toMatch(/[0-9a-f-]{36}$/))
    expect(await screen.findByText('Não foi possível concluir agora.')).toBeInTheDocument()
    expect(screen.getByText('A data da observação não muda depois de salvar.')).toBeInTheDocument()
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
    expect(screen.getByLabelText('Nota')).toHaveValue('8')
    await user.click(saveButton())
    await waitFor(() => expect(sent.filter((write) => write.method === 'PUT')).toHaveLength(2))
    expect(sent.filter((write) => write.method === 'POST')).toHaveLength(1)
  })

  it('avisa a data da observacao no futuro', async () => {
    // Arrange
    server.use(createReportFutureDate)
    const user = userEvent.setup()
    renderRoute(NEW)
    await user.type(await screen.findByLabelText('Relato'), 'Jogo contra o Vila Nova.')

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByText('A data da observação não pode estar no futuro.')).toBeInTheDocument()
  })

  it('mantem as edicoes no conflito e carrega a versao atual quando pedido', async () => {
    // Arrange
    const user = userEvent.setup()
    renderRoute(`/jogadores/1005/relatorios/${REPORT_IDS.draft1005}`)
    await screen.findByDisplayValue('Jogo da Copa do Brasil, entrou no intervalo.')
    await user.type(narrative(), ' Edição local.')

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByText('Este relatório foi alterado em outra aba.')).toBeInTheDocument()
    expect(narrative()).toHaveValue('Jogo da Copa do Brasil, entrou no intervalo. Edição local.')
    expect(saveButton()).toBeDisabled()
    expect(finalizeButton()).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Carregar a versão atual' }))
    await waitFor(() => expect(narrative()).toHaveValue('Jogo da Copa do Brasil, entrou no intervalo.'))
    expect(screen.queryByText('Este relatório foi alterado em outra aba.')).not.toBeInTheDocument()
  })

  it('mostra a leitura quando o relatorio ja foi finalizado em outra aba', async () => {
    // Arrange
    const user = userEvent.setup()
    await openLooseDraft()
    server.use(
      editReportAlreadyFinalized,
      http.get(REPORT_ITEM, ({ response }) =>
        response.untyped(
          HttpResponse.json({ ...looseDraftReport(), status: 'Finalizado', finalizadoEm: '2026-11-23T12:00:00Z', version: 5 }),
        ),
      ),
    )
    await user.type(narrative(), '!')

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByText('Este relatório já foi finalizado.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Relato')).not.toBeInTheDocument()
  })

  it('mostra o relatorio inexistente', async () => {
    // Act
    renderRoute(report(REPORT_IDS.missing))

    // Assert
    expect(await screen.findByText('Relatório não encontrado.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar aos relatórios' })).toHaveAttribute('href', '/jogadores/1001/relatorios')
  })

  it('mostra o esqueleto enquanto o relatorio nao chega', async () => {
    // Arrange
    server.use(reportPending)

    // Act
    renderRoute(report(REPORT_IDS.looseDraft))

    // Assert
    expect(await screen.findByRole('status', { name: 'Carregando relatório' })).toBeInTheDocument()
  })

  it('poe o nome do jogador no titulo da aba do navegador', async () => {
    // Act
    await openLooseDraft()

    // Assert
    await waitFor(() => expect(document.title).toBe('Relatório · Rafael Montes · APIFootballScout'))
  })
})

describe('finalizacao, leitura e correcao', () => {
  it('mostra o que falta e deixa Finalizar relatorio desabilitado', async () => {
    // Act
    await openLooseDraft()

    // Assert
    const checklist = screen.getByRole('list', { name: 'Para finalizar' })
    expect(within(checklist).getByText(/2 pontos positivos/)).toHaveTextContent('2 pontos positivos (1 de 2)')
    expect(within(checklist).getByText(/2 pontos negativos/)).toHaveTextContent('2 pontos negativos (0 de 2)')
    expect(finalizeButton()).toBeDisabled()
  })

  it('confirma, salva o que mudou e finaliza com a versao nova', async () => {
    // Arrange
    const sent = writes()
    const user = userEvent.setup()
    await openLooseDraft()
    await completePoints(user)
    await user.click(finalizeButton())
    const dialog = await screen.findByRole('dialog', { name: 'Finalizar relatório?' })
    expect(dialog).toHaveTextContent('Depois de finalizado, o relatório não muda mais. Para ajustar, crie uma correção.')
    await user.click(within(dialog).getByRole('button', { name: 'Voltar' }))
    expect(sent).toHaveLength(0)
    await user.click(finalizeButton())

    // Act
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Finalizar relatório' }))

    // Assert
    expect(await screen.findByText('Vigente')).toBeInTheDocument()
    expect(sent.map((write) => `${write.method} ${write.path}`)).toEqual([
      `PUT /api/Relatorio/${REPORT_IDS.looseDraft}`,
      `PUT /api/Relatorio/${REPORT_IDS.looseDraft}/finalizar`,
    ])
    expect(sent[0].ifMatch).toBe('"2"')
    expect(sent[1].ifMatch).toBe('"3"')
    expect(screen.queryByLabelText('Relato')).not.toBeInTheDocument()
  })

  it.each([
    [finalizeReportMinimumContent, 'Inclua ao menos 2 pontos positivos e 2 negativos (20 caracteres no total).'],
    [finalizeReportConclusionMissing, 'Preencha nota e parecer antes de finalizar.'],
  ])('mostra a recusa da finalizacao', async (handler, message) => {
    // Arrange
    server.use(handler)
    const user = userEvent.setup()
    await openLooseDraft()
    await completePoints(user)
    await user.click(finalizeButton())

    // Act
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Finalizar relatório' }))

    // Assert
    expect(await screen.findByText(message)).toBeInTheDocument()
  })

  it('mostra o vigente so para leitura, com Criar correcao', async () => {
    // Act
    renderRoute(`/jogadores/1002/relatorios/${REPORT_IDS.current1002}`)

    // Assert
    expect(await screen.findByText('Vigente')).toBeInTheDocument()
    expect(screen.getByText('8,0 de 10')).toBeInTheDocument()
    expect(screen.getByText('Contratar')).toBeInTheDocument()
    expect(screen.getByText('Observado em 14/11/2026 · finalizado em 16/11/2026')).toBeInTheDocument()
    expect(screen.getByText(/Clássico estadual/)).toBeInTheDocument()
    expect(screen.getByText('Cruzamento de primeira')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Criar correção' })).toHaveAttribute(
      'href',
      `/jogadores/1002/relatorios/novo?corrige=${REPORT_IDS.current1002}`,
    )
  })

  it('abre a correcao com o relato e a data do relatorio corrigido e cria pela rota de correcoes', async () => {
    // Arrange
    const sent = writes()
    const user = userEvent.setup()
    const { router } = renderRoute(`/jogadores/1002/relatorios/novo?corrige=${REPORT_IDS.current1002}`)
    expect(await screen.findByDisplayValue(/Clássico estadual/)).toBeInTheDocument()
    expect(screen.getByText('14/11/2026')).toBeInTheDocument()
    expect(screen.getByText('A correção mantém a data da observação do relatório corrigido.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nota')).toHaveValue('')
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
    expect(screen.getByText('Corrige o relatório observado em 14/11/2026')).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('Correção · Caio Ventura · APIFootballScout'))

    // Act
    await user.click(saveButton())

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toMatch(/[0-9a-f-]{36}$/))
    expect(sent.map((write) => `${write.method} ${write.path}`)).toEqual([
      `POST /api/Relatorio/${REPORT_IDS.current1002}/correcoes`,
    ])
  })

  it('continua a correcao ja comecada do vigente', async () => {
    // Act
    renderRoute(report(REPORT_IDS.correction))

    // Assert
    expect(await screen.findByRole('link', { name: 'Continuar correção' })).toHaveAttribute(
      'href',
      report(REPORT_IDS.correctionDraft),
    )
    expect(screen.queryByRole('link', { name: 'Criar correção' })).not.toBeInTheDocument()
    expect(screen.getByText('Corrige o relatório observado em 02/11/2026')).toBeInTheDocument()
  })

  it('mostra no finalizado corrigido quem o corrigiu, sem Criar correcao', async () => {
    // Act
    renderRoute(report(REPORT_IDS.original))

    // Assert
    expect(await screen.findByRole('link', { name: 'Corrigido pela correção de 05/11/2026' })).toHaveAttribute(
      'href',
      report(REPORT_IDS.correction),
    )
    expect(screen.getByText('Finalizado')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Criar correção' })).not.toBeInTheDocument()
  })

  it('pergunta antes de sair com alteracoes nao salvas', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = await openLooseDraft()
    await user.type(narrative(), '!')

    // Act
    await user.click(screen.getByRole('link', { name: 'Métricas' }))

    // Assert
    const dialog = await screen.findByRole('dialog', { name: 'Sair sem salvar?' })
    expect(dialog).toHaveTextContent('As alterações deste relatório serão perdidas.')
    await user.click(within(dialog).getByRole('button', { name: 'Continuar editando' }))
    expect(router.state.location.pathname).toBe(report(REPORT_IDS.looseDraft))
    await user.click(screen.getByRole('link', { name: 'Métricas' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Sair' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/metricas'))
  })

  it('sai do relatorio novo sem perguntar quando nada foi digitado', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = renderRoute(NEW)
    await screen.findByLabelText('Relato')

    // Act
    await user.click(await screen.findByRole('link', { name: 'Métricas' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/metricas'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('sai sem perguntar quando nada mudou', async () => {
    // Arrange
    const user = userEvent.setup()
    const { router } = await openLooseDraft()

    // Act
    await user.click(screen.getByRole('link', { name: 'Métricas' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/metricas'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
