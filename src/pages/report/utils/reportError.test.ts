import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../api/client'
import { describeWriteError, isAlreadyFinalized, isConflict } from './reportError'

const apiError = (status: number, code?: string) =>
  new ApiError(status, code ? { status, code, detail: 'diagnostico' } : { status })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('isConflict', () => {
  it('reconhece o relatorio alterado por outra requisicao', () => {
    // Act
    const conflict = isConflict(apiError(412, 'relatorio.alterado_por_outra_requisicao'))

    // Assert
    expect(conflict).toBe(true)
  })

  it('nao confunde outro erro com conflito', () => {
    // Act
    const conflict = isConflict(apiError(409, 'relatorio.ja_finalizado'))

    // Assert
    expect(conflict).toBe(false)
  })
})

describe('isAlreadyFinalized', () => {
  it('reconhece o relatorio ja finalizado', () => {
    // Act
    const finalized = isAlreadyFinalized(apiError(409, 'relatorio.ja_finalizado'))

    // Assert
    expect(finalized).toBe(true)
  })

  it('nao confunde outro 409 com relatorio finalizado', () => {
    // Act
    const finalized = isAlreadyFinalized(apiError(409, 'relatorio.observacao_futura'))

    // Assert
    expect(finalized).toBe(false)
  })
})

describe('describeWriteError', () => {
  it.each([
    ['relatorio.conteudo_minimo_nao_atendido', 422, 'Inclua ao menos 2 pontos positivos e 2 negativos (20 caracteres no total).'],
    ['relatorio.conclusao_ausente', 422, 'Preencha nota e parecer antes de finalizar.'],
    ['relatorio.observacao_futura', 409, 'A data da observação não pode estar no futuro.'],
  ])('mostra %s num aviso acima dos botoes', (code, status, message) => {
    // Act
    const failure = describeWriteError(apiError(status, code))

    // Assert
    expect(failure).toEqual({ message, placement: 'notice' })
  })

  it('avisa que o relatorio ja foi finalizado', () => {
    // Act
    const failure = describeWriteError(apiError(409, 'relatorio.ja_finalizado'))

    // Assert
    expect(failure).toEqual({ message: 'Este relatório já foi finalizado.', placement: 'notice' })
  })

  it('mostra o conflito junto aos botoes', () => {
    // Act
    const failure = describeWriteError(apiError(412, 'relatorio.alterado_por_outra_requisicao'))

    // Assert
    expect(failure).toEqual({ message: 'Este relatório foi alterado em outra aba.', placement: 'buttons' })
  })

  it('mostra o erro desconhecido junto aos botoes', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    // Act
    const failure = describeWriteError(apiError(500))

    // Assert
    expect(failure).toEqual({ message: 'Não foi possível concluir agora.', placement: 'buttons' })
  })
})
