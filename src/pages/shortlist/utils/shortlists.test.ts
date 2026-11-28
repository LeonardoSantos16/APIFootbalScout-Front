import { describe, expect, it } from 'vitest'
import { atacantesShortlist, lateraisShortlist, meiasShortlist } from '../../../mocks/fixtures/shortlists'
import { fullText, isFull, listCurrency, validateName } from './shortlists'

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
