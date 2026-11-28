import { describe, expect, it } from 'vitest'
import {
  anaShortlists,
  atacantesShortlist,
  buildShortlist,
  lateraisShortlist,
  meiasShortlist,
} from '../../../mocks/fixtures/shortlists'
import { fullText, isFull, listCurrency, sortByName, targetsCount, targetsLabel, validateName } from './shortlists'

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

describe('listCurrency', () => {
  it('vem do primeiro alvo', () => {
    // Act
    const currency = listCurrency(lateraisShortlist())

    // Assert
    expect(currency).toBe('EUR')
  })

  it('nao existe numa shortlist vazia', () => {
    // Act
    const currency = listCurrency(meiasShortlist())

    // Assert
    expect(currency).toBeUndefined()
  })
})

describe('isFull', () => {
  it('reconhece a shortlist no limite', () => {
    // Assert
    expect(isFull(atacantesShortlist())).toBe(true)
    expect(isFull(lateraisShortlist())).toBe(false)
  })
})

describe('fullText', () => {
  it('usa o limite da resposta', () => {
    // Act
    const text = fullText({ ...atacantesShortlist(), limiteDeAlvos: 30 })

    // Assert
    expect(text).toBe('A shortlist atingiu o limite de 30 alvos.')
  })
})

describe('validateName', () => {
  it('tira os espacos das pontas', () => {
    // Act
    const check = validateName('  Volantes 2027 ')

    // Assert
    expect(check).toEqual({ ok: true, name: 'Volantes 2027' })
  })

  it.each(['', '   '])('recusa o nome "%s"', (name) => {
    // Act
    const check = validateName(name)

    // Assert
    expect(check).toEqual({ ok: false, error: 'Dê um nome à shortlist.' })
  })
})
