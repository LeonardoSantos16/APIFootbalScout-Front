import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../api/client'
import { buildFullProfile } from '../../../mocks/fixtures/profiles'
import { targetProfileView } from './targetRow'

const settled = { error: null, isError: false, isFetching: false }

afterEach(() => {
  vi.restoreAllMocks()
})

describe('targetProfileView', () => {
  it('mostra nome, posicao e clube do perfil', () => {
    // Act
    const view = targetProfileView(1001, { ...settled, data: buildFullProfile(1001) })

    // Assert
    expect(view).toMatchObject({ name: 'Rafael Montes', detail: 'Meio-campo, Atlético Serrano', loading: false })
  })

  it('fica carregando enquanto o perfil nao chega', () => {
    // Act
    const view = targetProfileView(1001, { ...settled, isFetching: true })

    // Assert
    expect(view).toMatchObject({ fallbackName: 'Jogador #1001', loading: true })
    expect(view.name).toBeUndefined()
  })

  it('oferece nova tentativa quando a fonte esta fora', () => {
    // Act
    const view = targetProfileView(1009, {
      ...settled,
      isError: true,
      error: new ApiError(502, { status: 502, code: 'sofascore.perfil_do_jogador_indisponivel' }),
    })

    // Assert
    expect(view).toMatchObject({ error: 'Não foi possível carregar o perfil agora.', canRetry: true, loading: false })
  })

  it('diz que o perfil nao existe sem nova tentativa', () => {
    // Act
    const view = targetProfileView(2017, { ...settled, isError: true, error: new ApiError(404, 'not found') })

    // Assert
    expect(view).toMatchObject({ error: 'Perfil não encontrado.', canRetry: false })
  })

  it('volta a carregar durante a nova tentativa', () => {
    // Act
    const view = targetProfileView(1009, { ...settled, isError: true, isFetching: true, error: new ApiError(502, {}) })

    // Assert
    expect(view.loading).toBe(true)
  })
})
