import { describe, expect, it } from 'vitest'
import type { Attribute, AttributeType } from '../interfaces/attribute'
import { refusalText } from './attributes'

const refused = (type: AttributeType, reason: Attribute['motivo'], sample?: number): Attribute => ({
  tipo: type,
  resultado: 'Recusada',
  motivo: reason,
  amostraEmMinutos: sample,
})

describe('refusalText', () => {
  it('mostra a amostra contra o minimo', () => {
    // Act
    const text = refusalText(refused('Gols', 'AmostraInsuficiente', 312))

    // Assert
    expect(text).toBe('Amostra insuficiente: 312 de 450 min')
  })

  it('mostra so o minimo quando a amostra nao vem', () => {
    // Act
    const text = refusalText(refused('Gols', 'AmostraInsuficiente'))

    // Assert
    expect(text).toBe('Amostra insuficiente: mínimo de 450 min')
  })

  it('usa o separador de milhar na amostra', () => {
    // Act
    const text = refusalText(refused('Gols', 'AmostraInsuficiente', 1050))

    // Assert
    expect(text).toBe('Amostra insuficiente: 1.050 de 450 min')
  })

  it('diz que a fonte nao publicou', () => {
    // Act
    const text = refusalText(refused('Interceptacoes', 'FonteNaoAtribuiu'))

    // Assert
    expect(text).toBe('Não publicado pela fonte')
  })
})
