import { describe, expect, it } from 'vitest'
import type { ReportResponse } from '../interfaces/report'
import { buildTimeline } from './timeline'

const at = (year: number, month: number, day: number) => new Date(year, month - 1, day, 12).toISOString()

const report = (overrides: Partial<ReportResponse> & Pick<ReportResponse, 'relatorioId'>): ReportResponse => ({
  jogadorId: 1001,
  status: 'Rascunho',
  texto: 'Relato',
  observadoEm: at(2026, 11, 2),
  escritoEm: at(2026, 11, 2),
  pontosPositivos: [],
  pontosNegativos: [],
  version: 1,
  ...overrides,
})

const original = report({
  relatorioId: 'original',
  status: 'Finalizado',
  nota: 6.5,
  parecer: 'Monitorar',
  escritoEm: at(2026, 11, 3),
  finalizadoEm: at(2026, 11, 3),
})

const correction = report({
  relatorioId: 'correcao',
  status: 'Finalizado',
  nota: 7.5,
  parecer: 'Contratar',
  escritoEm: at(2026, 11, 5),
  finalizadoEm: at(2026, 11, 5),
  corrigeRelatorioId: 'original',
})

const correctionDraft = report({
  relatorioId: 'correcao-da-correcao',
  escritoEm: at(2026, 11, 12),
  corrigeRelatorioId: 'correcao',
})

const looseDraft = report({
  relatorioId: 'solto',
  observadoEm: at(2026, 11, 20),
  escritoEm: at(2026, 11, 20),
})

describe('buildTimeline', () => {
  it('junta a cadeia de correcoes num grupo, com o original primeiro', () => {
    // Act
    const groups = buildTimeline([correctionDraft, original, correction])

    // Assert
    expect(groups).toHaveLength(1)
    expect(groups[0].items.map((item) => item.id)).toEqual(['original', 'correcao', 'correcao-da-correcao'])
  })

  it('poe uma correcao cujo relatorio corrigido nao esta na lista no proprio grupo', () => {
    // Act
    const groups = buildTimeline([correction])

    // Assert
    expect(groups).toHaveLength(1)
    expect(groups[0].items.map((item) => item.id)).toEqual(['correcao'])
  })

  it('ordena os grupos da observacao mais recente para a mais antiga', () => {
    // Act
    const groups = buildTimeline([original, correction, looseDraft])

    // Assert
    expect(groups.map((group) => group.id)).toEqual(['solto', 'original'])
  })

  it('ordena os itens do grupo pela data de escrita, do mais antigo para o mais novo', () => {
    // Act
    const groups = buildTimeline([correction, correctionDraft, original])

    // Assert
    expect(groups[0].items.map((item) => item.id)).toEqual(['original', 'correcao', 'correcao-da-correcao'])
  })

  it('marca como vigente o finalizado mais recente, sem dar a vigencia a uma correcao em rascunho', () => {
    // Act
    const [group] = buildTimeline([original, correction, correctionDraft])

    // Assert
    expect(group.items.map((item) => item.status)).toEqual(['finalized', 'current', 'draft'])
  })

  it('marca como vigente o unico finalizado do grupo', () => {
    // Act
    const [group] = buildTimeline([original])

    // Assert
    expect(group.items[0].status).toBe('current')
  })

  it('intitula o original pela data da observacao e a correcao pela data de escrita', () => {
    // Act
    const [group] = buildTimeline([original, correction])

    // Assert
    expect(group.items.map((item) => item.title)).toEqual(['Observado em 02/11/2026', 'Correção de 05/11/2026'])
  })

  it('rotula o grupo pela data da observacao', () => {
    // Act
    const [group] = buildTimeline([original])

    // Assert
    expect(group.label).toBe('Relatório observado em 02/11/2026')
  })

  it('descreve a nota com uma casa decimal e o parecer', () => {
    // Act
    const [group] = buildTimeline([original])

    // Assert
    expect(group.items[0].detail).toBe('6,5 de 10 · Monitorar')
  })

  it('descreve o rascunho sem nota e sem parecer', () => {
    // Act
    const [group] = buildTimeline([looseDraft])

    // Assert
    expect(group.items[0].detail).toBe('Sem nota · Sem parecer')
  })

  it('descreve so o que falta quando o rascunho tem nota e nao tem parecer', () => {
    // Act
    const [group] = buildTimeline([report({ relatorioId: 'parcial', nota: 8 })])

    // Assert
    expect(group.items[0].detail).toBe('8,0 de 10 · Sem parecer')
  })

  it('diz que o relatorio foi corrigido pela correcao finalizada', () => {
    // Act
    const [group] = buildTimeline([original, correction])

    // Assert
    expect(group.items[0].note).toBe('Corrigido pela correção de 05/11/2026')
  })

  it('nao diz que o relatorio foi corrigido quando a correcao ainda e rascunho', () => {
    // Act
    const [group] = buildTimeline([original, correction, correctionDraft])

    // Assert
    expect(group.items[1].note).toBeUndefined()
  })

  it('aponta no vigente a correcao em rascunho que ja foi comecada', () => {
    // Act
    const [group] = buildTimeline([original, correction, correctionDraft])

    // Assert
    expect(group.items[1].pendingCorrectionId).toBe('correcao-da-correcao')
    expect(group.items[0].pendingCorrectionId).toBeUndefined()
  })

  it('nao entra em laco quando duas correcoes se referenciam', () => {
    // Arrange
    const first = report({ relatorioId: 'a', corrigeRelatorioId: 'b' })
    const second = report({ relatorioId: 'b', corrigeRelatorioId: 'a', escritoEm: at(2026, 11, 3) })

    // Act
    const groups = buildTimeline([first, second])

    // Assert
    expect(groups.flatMap((group) => group.items.map((item) => item.id)).sort()).toEqual(['a', 'b'])
  })
})
