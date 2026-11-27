import { describe, expect, it } from 'vitest'
import type { ReportForm } from '../interfaces/report'
import { buildChecklist, isComplete } from './checklist'

const form = (overrides: Partial<ReportForm> = {}): ReportForm => ({
  observation: '2026-11-20',
  narrative: 'Relato',
  rating: '7,5',
  verdict: 'Monitorar',
  positivePoints: ['Recebe de costas e gira rápido'],
  negativePoints: [],
  ...overrides,
})

describe('buildChecklist', () => {
  it('lista os cinco itens com o que ja foi cumprido e as contagens', () => {
    // Act
    const items = buildChecklist(form())

    // Assert
    expect(items).toEqual([
      { label: 'Nota', done: true },
      { label: 'Parecer', done: true },
      { label: '2 pontos positivos', done: false, progress: '1 de 2' },
      { label: '2 pontos negativos', done: false, progress: '0 de 2' },
      { label: '20 caracteres nos pontos', done: true, progress: '30 de 20' },
    ])
  })

  it('nao conta pontos vazios nem os espacos das pontas', () => {
    // Act
    const items = buildChecklist(form({ positivePoints: ['  Fôlego  ', '', '   '] }))

    // Assert
    expect(items[2]).toEqual({ label: '2 pontos positivos', done: false, progress: '1 de 2' })
    expect(items[4]).toEqual({ label: '20 caracteres nos pontos', done: false, progress: '6 de 20' })
  })

  it('deixa a nota pendente quando ela esta vazia ou invalida', () => {
    // Act
    const empty = buildChecklist(form({ rating: '' }))
    const invalid = buildChecklist(form({ rating: '11' }))

    // Assert
    expect(empty[0].done).toBe(false)
    expect(invalid[0].done).toBe(false)
  })

  it('deixa o parecer pendente quando nenhum foi escolhido', () => {
    // Act
    const items = buildChecklist(form({ verdict: null }))

    // Assert
    expect(items[1].done).toBe(false)
  })
})

describe('isComplete', () => {
  it('fecha quando todos os itens foram cumpridos', () => {
    // Arrange
    const items = buildChecklist(
      form({ positivePoints: ['Cruzamento', 'Fôlego'], negativePoints: ['Recomposição', 'Jogo aéreo'] }),
    )

    // Act
    const complete = isComplete(items)

    // Assert
    expect(complete).toBe(true)
  })

  it('fica aberto enquanto falta um item', () => {
    // Act
    const complete = isComplete(buildChecklist(form()))

    // Assert
    expect(complete).toBe(false)
  })
})
