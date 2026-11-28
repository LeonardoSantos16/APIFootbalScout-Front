import { describe, expect, it } from 'vitest'
import { anaShortlists, buildShortlist, lateraisShortlist } from '../mocks/fixtures/shortlists'
import { formatCost, sortByName, targetsCount, targetsLabel } from './shortlists'

describe('sortByName', () => {
  it('ordena as shortlists pelo nome', () => {
    // Act
    const names = sortByName(anaShortlists()).map((shortlist) => shortlist.nome)

    // Assert
    expect(names).toEqual(['Atacantes', 'Conflito', 'Laterais 2027', 'Meias para janeiro'])
  })

  it('respeita os acentos do portugues', () => {
    // Arrange
    const shortlists = [
      buildShortlist({ shortlistId: 'b', nome: 'Zagueiros' }),
      buildShortlist({ shortlistId: 'a', nome: 'Água Santa' }),
      buildShortlist({ shortlistId: 'c', nome: 'Base' }),
    ]

    // Act
    const names = sortByName(shortlists).map((shortlist) => shortlist.nome)

    // Assert
    expect(names).toEqual(['Água Santa', 'Base', 'Zagueiros'])
  })

  it('nao altera a lista recebida', () => {
    // Arrange
    const shortlists = anaShortlists()

    // Act
    sortByName(shortlists)

    // Assert
    expect(shortlists[0].nome).toBe('Laterais 2027')
  })
})

describe('targetsCount e targetsLabel', () => {
  it('usam o limite da resposta', () => {
    // Arrange
    const shortlist = { ...lateraisShortlist(), limiteDeAlvos: 30 }

    // Act
    const count = targetsCount(shortlist)
    const label = targetsLabel(shortlist)

    // Assert
    expect(count).toBe('4 de 30')
    expect(label).toBe('4 de 30 alvos')
  })
})

describe('formatCost', () => {
  it.each([
    [1_250_000_000, 'EUR', '€12,5M'],
    [85_000_000, 'EUR', '€850 mil'],
    [975_000_000, 'GBP', '£9,8M'],
    [400_000_000, 'BRL', 'R$4M'],
  ])('mostra %i centavos em %s como %s', (quantiaEmCentavos, moeda, text) => {
    // Act
    const formatted = formatCost({ quantiaEmCentavos, moeda })

    // Assert
    expect(formatted).toBe(text)
  })
})
