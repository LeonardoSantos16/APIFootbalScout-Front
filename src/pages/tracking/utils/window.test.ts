import { describe, expect, it } from 'vitest'
import type { TrackingWindow } from '../interfaces/tracking'
import { windowText } from './window'

const janela = (de: string, duracaoEmDias: number): TrackingWindow => ({
  de,
  ate: '2026-11-18T14:00:00Z',
  duracaoEmDias,
})

describe('windowText', () => {
  it('diz a data da linha de base e os dias arredondados para baixo', () => {
    // Act
    const text = windowText(janela('2026-10-22T14:00:00Z', 27.4))

    // Assert
    expect(text).toBe('Linha de base de 22/10/2026 · comparando os últimos 27 dias')
  })

  it('usa o singular com um dia', () => {
    // Act
    const text = windowText(janela('2026-11-17T09:00:00Z', 1.6))

    // Assert
    expect(text).toBe('Linha de base de 17/11/2026 · comparando o último dia')
  })

  it('usa o plural com dois dias exatos', () => {
    // Act
    const text = windowText(janela('2026-11-16T14:00:00Z', 2))

    // Assert
    expect(text).toBe('Linha de base de 16/11/2026 · comparando os últimos 2 dias')
  })

  it('diz que a linha de base foi medida hoje com menos de um dia', () => {
    // Act
    const text = windowText(janela('2026-11-18T09:00:00Z', 0.2))

    // Assert
    expect(text).toBe('Linha de base medida hoje')
  })

  it('formata a data em UTC', () => {
    // Act
    const text = windowText(janela('2026-10-22T23:30:00Z', 27.4))

    // Assert
    expect(text).toBe('Linha de base de 22/10/2026 · comparando os últimos 27 dias')
  })
})
