import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../api/client'
import { describeComparisonError } from './comparisonError'

const SLICE_TEXT = 'Brasileirão Série A · 2025'

const apiError = (status: number, code?: string) =>
  new ApiError(status, code ? { status, code, detail: 'diagnostico' } : { status })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('describeComparisonError', () => {
  it('diz que o jogador escolhido nao tem estatisticas no recorte', () => {
    // Act
    const failure = describeComparisonError(apiError(404, 'jogador.estatisticas_nao_encontradas'), {
      otherName: 'Caio Ventura',
      sliceText: SLICE_TEXT,
    })

    // Assert
    expect(failure).toEqual({
      message: 'Caio Ventura não tem estatísticas em Brasileirão Série A · 2025.',
      canRetry: false,
      notFound: true,
    })
  })

  it('usa o jogador escolhido quando o nome nao e conhecido', () => {
    // Act
    const failure = describeComparisonError(apiError(404, 'jogador.estatisticas_nao_encontradas'), {
      sliceText: SLICE_TEXT,
    })

    // Assert
    expect(failure.message).toBe('O jogador escolhido não tem estatísticas em Brasileirão Série A · 2025.')
  })

  it('diz que o jogador escolhido nao foi encontrado', () => {
    // Act
    const failure = describeComparisonError(apiError(404, 'jogador.perfil_nao_encontrado'), {
      otherName: 'Caio Ventura',
      sliceText: SLICE_TEXT,
    })

    // Assert
    expect(failure).toEqual({ message: 'O jogador escolhido não foi encontrado.', canRetry: false, notFound: true })
  })

  it('oferece nova tentativa com a fonte fora', () => {
    // Act
    const failure = describeComparisonError(apiError(502, 'sofascore.estatisticas_do_jogador_indisponiveis'), {
      sliceText: SLICE_TEXT,
    })

    // Assert
    expect(failure).toEqual({ message: 'Não foi possível comparar agora.', canRetry: true, notFound: false })
  })

  it('usa a mensagem do code para o mesmo jogador dos dois lados', () => {
    // Act
    const failure = describeComparisonError(apiError(400, 'comparacao.jogador_consigo_mesmo'), {
      sliceText: SLICE_TEXT,
    })

    // Assert
    expect(failure).toEqual({ message: 'Escolha dois jogadores diferentes.', canRetry: false, notFound: false })
  })

  it('cai no erro generico com um code desconhecido', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const failure = describeComparisonError(apiError(500, 'algo.novo'), { sliceText: SLICE_TEXT })

    // Assert
    expect(failure).toEqual({ message: 'Não foi possível concluir agora.', canRetry: true, notFound: false })
  })
})
