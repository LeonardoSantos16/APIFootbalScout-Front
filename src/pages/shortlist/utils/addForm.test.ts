import { describe, expect, it } from 'vitest'
import { SHORTLIST_IDS, anaShortlists, atacantesShortlist, meiasShortlist } from '../../../mocks/fixtures/shortlists'
import { resolveAddForm, withCreated } from './addForm'

const RAFAEL = 1001
const EUR_12_5 = { value: 12_500_000, currency: 'EUR' }

describe('resolveAddForm', () => {
  it('parte da primeira shortlist que aceita o jogador, com a moeda travada e o valor de mercado', () => {
    // Act
    const view = resolveAddForm(anaShortlists(), RAFAEL, EUR_12_5, {})

    // Assert
    expect(view.selected?.nome).toBe('Conflito')
    expect(view.currency).toBe('EUR')
    expect(view.lockedCurrency).toBe(true)
    expect(view.currencyHint).toBe('A moeda da lista é EUR.')
    expect(view.cost).toBe('12,5')
    expect(view.priority).toBe('3')
  })

  it('libera a moeda e vai para o topo numa shortlist vazia', () => {
    // Act
    const view = resolveAddForm(anaShortlists(), RAFAEL, EUR_12_5, { shortlistId: SHORTLIST_IDS.meias })

    // Assert
    expect(view.lockedCurrency).toBe(false)
    expect(view.currencyHint).toBe('O primeiro alvo define a moeda da lista.')
    expect(view.priorityOptions).toEqual([{ value: '1', label: '1 — no topo' }])
    expect(view.priority).toBe('1')
  })

  it('ignora a escolha de uma shortlist que nao aceita o jogador', () => {
    // Act
    const view = resolveAddForm(anaShortlists(), RAFAEL, EUR_12_5, { shortlistId: SHORTLIST_IDS.laterais })

    // Assert
    expect(view.selected?.nome).toBe('Conflito')
  })

  it('volta a prioridade para o fim quando a shortlist muda', () => {
    // Act
    const view = resolveAddForm(anaShortlists(), RAFAEL, EUR_12_5, {
      shortlistId: SHORTLIST_IDS.meias,
      priority: { shortlistId: SHORTLIST_IDS.conflito, value: '1' },
    })

    // Assert
    expect(view.priority).toBe('1')
    expect(view.priorityOptions).toHaveLength(1)
  })

  it('mantem o custo digitado e a moeda escolhida numa lista vazia', () => {
    // Act
    const view = resolveAddForm(anaShortlists(), RAFAEL, EUR_12_5, {
      shortlistId: SHORTLIST_IDS.meias,
      currency: 'BRL',
      cost: '60',
    })

    // Assert
    expect(view.currency).toBe('BRL')
    expect(view.cost).toBe('60')
  })

  it('deixa o custo vazio quando o valor de mercado esta em outra moeda', () => {
    // Act
    const view = resolveAddForm(anaShortlists(), RAFAEL, { value: 60_000_000, currency: 'BRL' }, {})

    // Assert
    expect(view.cost).toBe('')
  })

  it('fica sem shortlist escolhida quando nenhuma aceita o jogador', () => {
    // Act
    const view = resolveAddForm([atacantesShortlist()], RAFAEL, EUR_12_5, {})

    // Assert
    expect(view.selected).toBeUndefined()
  })
})

describe('withCreated', () => {
  it('acrescenta a shortlist recem-criada que a lista ainda nao trouxe', () => {
    // Arrange
    const created = { ...meiasShortlist(), shortlistId: 'nova', nome: 'Volantes' }

    // Act
    const list = withCreated([], created)

    // Assert
    expect(list).toEqual([created])
  })

  it('nao repete a shortlist que a lista ja trouxe', () => {
    // Arrange
    const created = meiasShortlist()

    // Act
    const list = withCreated([meiasShortlist()], created)

    // Assert
    expect(list).toHaveLength(1)
  })
})
