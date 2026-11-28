import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../api/client'
import { conflictText, isShortlistConflict, profileFailure, writeErrorText } from './shortlistError'

const apiError = (status: number, code?: string) =>
  new ApiError(status, code ? { status, code, detail: 'diagnostico' } : { status })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('isShortlistConflict', () => {
  it('reconhece a shortlist alterada por outra requisicao', () => {
    // Act
    const conflict = isShortlistConflict(apiError(412, 'shortlist.alterada_por_outra_requisicao'))

    // Assert
    expect(conflict).toBe(true)
  })

  it('trata o 412 sem code como conflito', () => {
    // Act
    const conflict = isShortlistConflict(apiError(412))

    // Assert
    expect(conflict).toBe(true)
  })

  it('nao confunde uma recusa com conflito', () => {
    // Act
    const conflict = isShortlistConflict(apiError(422, 'shortlist.prioridade_fora_da_ordem'))

    // Assert
    expect(conflict).toBe(false)
  })
})

describe('writeErrorText', () => {
  it('usa o texto de conflito de cada lugar', () => {
    // Arrange
    const error = apiError(412, 'shortlist.alterada_por_outra_requisicao')

    // Act
    const page = writeErrorText(error, 'page')
    const dialog = writeErrorText(error, 'dialog')

    // Assert
    expect(page).toBe(conflictText('page'))
    expect(page).toBe('Esta shortlist foi alterada em outra aba. A lista foi atualizada; refaça a mudança.')
    expect(dialog).toBe('Esta shortlist foi alterada em outra aba. Confira e tente de novo.')
  })

  it.each([
    ['shortlist.prioridade_fora_da_ordem', 'Prioridade fora da ordem da lista.'],
    ['shortlist.alvo_nao_encontrado', 'Este jogador não está na shortlist.'],
    ['shortlist.jogador_ja_na_lista', 'Este jogador já está na shortlist.'],
    ['shortlist.limite_de_alvos_atingido', 'A shortlist atingiu o limite de 25 alvos.'],
    ['shortlist.moeda_divergente', 'Todos os custos da shortlist precisam usar a mesma moeda.'],
  ])('mostra %s pelo code', (code, text) => {
    // Act
    const message = writeErrorText(apiError(422, code), 'page')

    // Assert
    expect(message).toBe(text)
  })

  it('cai no erro generico sem code', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act
    const message = writeErrorText(apiError(500), 'page')

    // Assert
    expect(message).toBe('Não foi possível concluir agora.')
  })
})

describe('profileFailure', () => {
  it('oferece nova tentativa quando a fonte esta fora', () => {
    // Act
    const failure = profileFailure(new ApiError(502, { status: 502, code: 'sofascore.perfil_do_jogador_indisponivel' }))

    // Assert
    expect(failure).toEqual({ message: 'Não foi possível carregar o perfil agora.', canRetry: true })
  })

  it('diz que o perfil nao existe sem nova tentativa', () => {
    // Act
    const failure = profileFailure(new ApiError(404, 'Player with ID 2017 not found'))

    // Assert
    expect(failure).toEqual({ message: 'Perfil não encontrado.', canRetry: false })
  })
})
