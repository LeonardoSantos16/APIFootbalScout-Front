import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './client'
import { GENERIC_MESSAGE, MESSAGE_BY_CODE, describeError } from './errors'
import { IncompleteResponseError } from '../utils/attributes'

const problem = (status: number, fields: Record<string, unknown> = {}) =>
  new ApiError(status, {
    type: 'https://tools.ietf.org/html/rfc9110',
    title: 'Some title',
    status,
    detail: 'Detail in english, nao vai para a tela',
    instance: 'GET /api/Analise/1001/metricas-por-90',
    ...fields,
  })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('describeError pelo code', () => {
  it.each([
    [502, 'sofascore.estatisticas_do_jogador_indisponiveis', 'Estatísticas indisponíveis no momento.', true],
    [502, 'sofascore.perfil_do_jogador_indisponivel', 'Não foi possível carregar o perfil agora.', true],
    [404, 'jogador.estatisticas_nao_encontradas', 'Sem estatísticas para esta competição e temporada.', false],
    [
      404,
      'jogador.perfil_nao_encontrado',
      'Não há dados deste jogador para a competição e temporada escolhidas.',
      false,
    ],
    [422, 'shortlist.jogador_ja_na_lista', 'Este jogador já está na shortlist.', false],
    [409, 'acompanhamento.jogador_ja_acompanhado', 'Você já acompanha este jogador.', false],
  ])('%d %s mostra "%s"', (status, code, message, canRetry) => {
    // Act
    const described = describeError(problem(status, { code }))

    // Assert
    expect(described).toEqual({ message, canRetry })
  })

  it('cobre a tabela inteira de docs/erros.md', () => {
    // Act
    const codes = Object.keys(MESSAGE_BY_CODE)

    // Assert
    expect(codes).toHaveLength(47)
  })

  it('escreve todas as mensagens com ponto final e sem a palavra recorte', () => {
    // Act
    const messages = Object.values(MESSAGE_BY_CODE)

    // Assert
    expect(messages.filter((m) => !m.endsWith('.'))).toEqual([])
    expect(messages.filter((m) => /recorte/i.test(m))).toEqual([])
  })

  it.each([
    ['atributo.tipo_desconhecido'],
    ['afericao.valor_invalido'],
    ['estatistica_acumulavel.negativa'],
    ['valor_derivado.divisao_por_zero'],
    ['comparacao.motivo_invalido'],
  ])('trata o code interno %s como erro generico', (code) => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const described = describeError(problem(500, { code }))

    // Assert
    expect(described).toEqual({ message: GENERIC_MESSAGE, canRetry: true })
  })

  it('trata um code desconhecido como erro generico', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const described = describeError(problem(500, { code: 'novo.code_da_api' }))

    // Assert
    expect(described).toEqual({ message: GENERIC_MESSAGE, canRetry: true })
  })

  it('nunca oferece nova tentativa num 4xx, nem com code desconhecido', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const described = describeError(problem(404, { code: 'novo.code_da_api' }))

    // Assert
    expect(described).toEqual({ message: GENERIC_MESSAGE, canRetry: false })
  })

  it('nao mostra o detail nem o title', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const described = describeError(problem(500))

    // Assert
    expect(described.message).not.toContain('Detail')
    expect(described.message).not.toContain('title')
  })
})

describe('describeError sem code', () => {
  it('trata ProblemDetails sem code como erro desconhecido', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const described = describeError(problem(500))

    // Assert
    expect(described).toEqual({ message: GENERIC_MESSAGE, canRetry: true })
  })

  it('mostra "Jogador não encontrado." no 404 em texto puro', () => {
    // Act
    const described = describeError(new ApiError(404, 'Player with ID 12 not found'), { plainText: true })

    // Assert
    expect(described).toEqual({ message: 'Jogador não encontrado.', canRetry: false })
  })

  it('mostra a falha do perfil no 502 em texto puro', () => {
    // Act
    const described = describeError(new ApiError(502, undefined), { plainText: true })

    // Assert
    expect(described).toEqual({ message: 'Não foi possível carregar o perfil agora.', canRetry: true })
  })

  it('prefere o code ao status num endpoint de texto puro', () => {
    // Act
    const described = describeError(problem(502, { code: 'sofascore.detalhes_do_jogador_indisponiveis' }), {
      plainText: true,
    })

    // Assert
    expect(described).toEqual({ message: 'Dados do jogador indisponíveis no momento.', canRetry: true })
  })

  it.each([
    [400, false],
    [500, true],
  ])('mostra o erro generico nos demais status em texto puro (%d)', (status, canRetry) => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const described = describeError(new ApiError(status, 'Name is required'), { plainText: true })

    // Assert
    expect(described).toEqual({ message: GENERIC_MESSAGE, canRetry })
  })

  it('nao mostra o texto puro do corpo', () => {
    // Act
    const described = describeError(new ApiError(404, 'Player with ID 12 not found'), { plainText: true })

    // Assert
    expect(described.message).not.toContain('Player')
  })
})

describe('describeError fora da API', () => {
  it.each([
    ['resposta incompleta', new IncompleteResponseError('Gols')],
    ['falha de rede', new TypeError('Failed to fetch')],
  ])('trata %s como erro generico com nova tentativa', (_case, error) => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const described = describeError(error)

    // Assert
    expect(described).toEqual({ message: GENERIC_MESSAGE, canRetry: true })
  })
})

describe('registro do erro desconhecido', () => {
  it('registra o instance no console', () => {
    // Arrange
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    describeError(problem(500))

    // Assert
    expect(logSpy).toHaveBeenCalledWith(expect.any(String), 'GET /api/Analise/1001/metricas-por-90')
  })

  it('nao registra um erro conhecido', () => {
    // Arrange
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    describeError(problem(502, { code: 'sofascore.estatisticas_do_jogador_indisponiveis' }))

    // Assert
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('registra o erro desconhecido mesmo sem instance', () => {
    // Arrange
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new TypeError('Failed to fetch')

    // Act
    describeError(error)

    // Assert
    expect(logSpy).toHaveBeenCalledWith(expect.any(String), error)
  })
})
