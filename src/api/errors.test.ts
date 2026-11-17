import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './client'
import { MENSAGEM_GENERICA, MENSAGEM_POR_CODE, describeError } from './errors'
import { RespostaIncompletaError } from '../pages/metricas/utils/metricas'

const problema = (status: number, campos: Record<string, unknown> = {}) =>
  new ApiError(status, {
    type: 'https://tools.ietf.org/html/rfc9110',
    title: 'Some title',
    status,
    detail: 'Detail in english, nao vai para a tela',
    instance: 'GET /api/Analise/1001/metricas-por-90',
    ...campos,
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
  ])('%d %s mostra "%s"', (status, code, mensagem, podeRepetir) => {
    // Act
    const erro = describeError(problema(status, { code }))

    // Assert
    expect(erro).toEqual({ mensagem, podeRepetir })
  })

  it('cobre a tabela inteira de docs/erros.md', () => {
    // Act
    const codes = Object.keys(MENSAGEM_POR_CODE)

    // Assert
    expect(codes).toHaveLength(47)
  })

  it('escreve todas as mensagens com ponto final e sem a palavra recorte', () => {
    // Act
    const mensagens = Object.values(MENSAGEM_POR_CODE)

    // Assert
    expect(mensagens.filter((m) => !m.endsWith('.'))).toEqual([])
    expect(mensagens.filter((m) => /recorte/i.test(m))).toEqual([])
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
    const erro = describeError(problema(500, { code }))

    // Assert
    expect(erro).toEqual({ mensagem: MENSAGEM_GENERICA, podeRepetir: true })
  })

  it('trata um code desconhecido como erro generico', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const erro = describeError(problema(500, { code: 'novo.code_da_api' }))

    // Assert
    expect(erro).toEqual({ mensagem: MENSAGEM_GENERICA, podeRepetir: true })
  })

  it('nunca oferece nova tentativa num 4xx, nem com code desconhecido', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const erro = describeError(problema(404, { code: 'novo.code_da_api' }))

    // Assert
    expect(erro).toEqual({ mensagem: MENSAGEM_GENERICA, podeRepetir: false })
  })

  it('nao mostra o detail nem o title', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const erro = describeError(problema(500))

    // Assert
    expect(erro.mensagem).not.toContain('Detail')
    expect(erro.mensagem).not.toContain('title')
  })
})

describe('describeError sem code', () => {
  it('trata ProblemDetails sem code como erro desconhecido', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const erro = describeError(problema(500))

    // Assert
    expect(erro).toEqual({ mensagem: MENSAGEM_GENERICA, podeRepetir: true })
  })

  it('mostra "Jogador não encontrado." no 404 em texto puro', () => {
    // Act
    const erro = describeError(new ApiError(404, 'Player with ID 12 not found'), { textoPuro: true })

    // Assert
    expect(erro).toEqual({ mensagem: 'Jogador não encontrado.', podeRepetir: false })
  })

  it('mostra a falha do perfil no 502 em texto puro', () => {
    // Act
    const erro = describeError(new ApiError(502, undefined), { textoPuro: true })

    // Assert
    expect(erro).toEqual({ mensagem: 'Não foi possível carregar o perfil agora.', podeRepetir: true })
  })

  it('prefere o code ao status num endpoint de texto puro', () => {
    // Act
    const erro = describeError(problema(502, { code: 'sofascore.detalhes_do_jogador_indisponiveis' }), {
      textoPuro: true,
    })

    // Assert
    expect(erro).toEqual({ mensagem: 'Dados do jogador indisponíveis no momento.', podeRepetir: true })
  })

  it.each([
    [400, false],
    [500, true],
  ])('mostra o erro generico nos demais status em texto puro (%d)', (status, podeRepetir) => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const erro = describeError(new ApiError(status, 'Name is required'), { textoPuro: true })

    // Assert
    expect(erro).toEqual({ mensagem: MENSAGEM_GENERICA, podeRepetir })
  })

  it('nao mostra o texto puro do corpo', () => {
    // Act
    const erro = describeError(new ApiError(404, 'Player with ID 12 not found'), { textoPuro: true })

    // Assert
    expect(erro.mensagem).not.toContain('Player')
  })
})

describe('describeError fora da API', () => {
  it.each([
    ['resposta incompleta', new RespostaIncompletaError('Gols')],
    ['falha de rede', new TypeError('Failed to fetch')],
  ])('trata %s como erro generico com nova tentativa', (_caso, error) => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const erro = describeError(error)

    // Assert
    expect(erro).toEqual({ mensagem: MENSAGEM_GENERICA, podeRepetir: true })
  })
})

describe('registro do erro desconhecido', () => {
  it('registra o instance no console', () => {
    // Arrange
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    describeError(problema(500))

    // Assert
    expect(log).toHaveBeenCalledWith(expect.any(String), 'GET /api/Analise/1001/metricas-por-90')
  })

  it('nao registra um erro conhecido', () => {
    // Arrange
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    describeError(problema(502, { code: 'sofascore.estatisticas_do_jogador_indisponiveis' }))

    // Assert
    expect(log).not.toHaveBeenCalled()
  })

  it('registra o erro desconhecido mesmo sem instance', () => {
    // Arrange
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new TypeError('Failed to fetch')

    // Act
    describeError(error)

    // Assert
    expect(log).toHaveBeenCalledWith(expect.any(String), error)
  })
})
