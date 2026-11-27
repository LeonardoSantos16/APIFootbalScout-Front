import { describe, expect, it } from 'vitest'
import type { ReportResponse } from '../interfaces/report'
import { correctionReference } from './correctionReference'

const corrected: ReportResponse = {
  relatorioId: 'original',
  jogadorId: 1001,
  status: 'Finalizado',
  texto: 'Relato',
  observadoEm: new Date(2026, 10, 2, 12).toISOString(),
  escritoEm: new Date(2026, 10, 3, 12).toISOString(),
  pontosPositivos: [],
  pontosNegativos: [],
  version: 4,
}

describe('correctionReference', () => {
  it('cita o original pela data da observacao', () => {
    // Act
    const text = correctionReference(corrected)

    // Assert
    expect(text).toBe('Corrige o relatório observado em 02/11/2026')
  })

  it('cita uma correcao pela data de escrita', () => {
    // Act
    const text = correctionReference({
      ...corrected,
      relatorioId: 'correcao',
      escritoEm: new Date(2026, 10, 5, 12).toISOString(),
      corrigeRelatorioId: 'original',
    })

    // Assert
    expect(text).toBe('Corrige a correção de 05/11/2026')
  })
})
