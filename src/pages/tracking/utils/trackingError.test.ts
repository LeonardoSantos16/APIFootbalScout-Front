import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../api/client'
import { describeOpeningError, describeReadingError, isAlreadyTracked, isNotTracked } from './trackingError'

const apiError = (status: number, code?: string) =>
  new ApiError(status, code ? { status, code, detail: 'diagnostico' } : { status })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('isNotTracked', () => {
  it('reconhece o jogador sem acompanhamento ativo', () => {
    // Act
    const notTracked = isNotTracked(apiError(404, 'acompanhamento.dossie_nao_encontrado'))

    // Assert
    expect(notTracked).toBe(true)
  })

  it('nao confunde outro 404 com jogador nao acompanhado', () => {
    // Act
    const notTracked = isNotTracked(apiError(404, 'jogador.perfil_nao_encontrado'))

    // Assert
    expect(notTracked).toBe(false)
  })

  it('nao confunde um erro qualquer com jogador nao acompanhado', () => {
    // Act
    const notTracked = isNotTracked(new Error('falhou'))

    // Assert
    expect(notTracked).toBe(false)
  })
})

describe('isAlreadyTracked', () => {
  it('reconhece o jogador ja acompanhado', () => {
    // Act
    const alreadyTracked = isAlreadyTracked(apiError(409, 'acompanhamento.jogador_ja_acompanhado'))

    // Assert
    expect(alreadyTracked).toBe(true)
  })

  it('nao confunde outro 409 com jogador ja acompanhado', () => {
    // Act
    const alreadyTracked = isAlreadyTracked(apiError(409, 'dossie.ja_encerrado'))

    // Assert
    expect(alreadyTracked).toBe(false)
  })
})

describe('describeReadingError', () => {
  it('oferece nova tentativa com a fonte fora', () => {
    // Act
    const failure = describeReadingError(apiError(502, 'sofascore.perfil_do_jogador_indisponivel'))

    // Assert
    expect(failure).toEqual({ message: 'Não foi possível ler o acompanhamento agora.', canRetry: true })
  })

  it('mostra o erro generico sem code', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const failure = describeReadingError(apiError(500))

    // Assert
    expect(failure.message).toBe('Não foi possível concluir agora.')
  })
})

describe('describeOpeningError', () => {
  it('oferece nova tentativa no lugar do botao com a fonte fora', () => {
    // Act
    const failure = describeOpeningError(apiError(502, 'sofascore.perfil_do_jogador_indisponivel'))

    // Assert
    expect(failure).toEqual({ message: 'Não foi possível acompanhar agora.', canRetry: true, placement: 'replace' })
  })

  it('avisa o limite de acompanhamentos abaixo do botao, sem sugerir encerrar', () => {
    // Act
    const failure = describeOpeningError(apiError(422, 'acompanhamento.limite_atingido'))

    // Assert
    expect(failure).toEqual({ message: 'Limite de 10 acompanhamentos atingido.', canRetry: false, placement: 'below' })
  })

  it('avisa o jogador sem base comparavel abaixo do botao', () => {
    // Act
    const failure = describeOpeningError(apiError(422, 'jogador.informacoes_insuficientes'))

    // Assert
    expect(failure).toEqual({
      message: 'O jogador não tem dados suficientes para servir de linha de base.',
      canRetry: false,
      placement: 'below',
    })
  })

  it('mostra outro erro pelo code no lugar do botao', () => {
    // Act
    const failure = describeOpeningError(apiError(400, 'recorte.contexto_invalido'))

    // Assert
    expect(failure).toEqual({
      message: 'Contexto inválido. Escolha clube ou seleção.',
      canRetry: false,
      placement: 'replace',
    })
  })
})
