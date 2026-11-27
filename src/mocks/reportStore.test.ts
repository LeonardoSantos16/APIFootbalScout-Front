import { beforeEach, describe, expect, it } from 'vitest'
import { REPORT_IDS } from './fixtures/reports'
import {
  correctReport,
  createReport,
  editReport,
  finalizeReport,
  findReport,
  listReports,
  resetReportStore,
} from './reportStore'

const NOW = new Date('2026-11-24T15:00:00Z')

beforeEach(() => {
  resetReportStore()
})

describe('listReports', () => {
  it('devolve os relatorios do jogador da observacao mais recente para a mais antiga', () => {
    // Act
    const reports = listReports(1001)

    // Assert
    expect(reports.map((report) => report.relatorioId)).toEqual([
      REPORT_IDS.looseDraft,
      REPORT_IDS.original,
      REPORT_IDS.correction,
      REPORT_IDS.correctionDraft,
    ])
  })

  it('devolve a lista vazia para quem nao tem relatorio', () => {
    // Act
    const reports = listReports(1003)

    // Assert
    expect(reports).toEqual([])
  })
})

describe('createReport', () => {
  it('abre o rascunho na versao 1 com a data de escrita de agora', () => {
    // Act
    const outcome = createReport({ jogadorId: 1003, texto: 'Relato', observadoEm: '2026-11-24T00:00:00-03:00' }, NOW)

    // Assert
    expect(outcome).toMatchObject({
      ok: true,
      report: { jogadorId: 1003, status: 'Rascunho', texto: 'Relato', version: 1, escritoEm: NOW.toISOString() },
    })
    expect(listReports(1003)).toHaveLength(1)
  })

  it('recusa a observacao no futuro', () => {
    // Act
    const outcome = createReport({ jogadorId: 1003, texto: 'Relato', observadoEm: '2026-11-25T12:00:00Z' }, NOW)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 409, code: 'relatorio.observacao_futura' })
  })

  it('recusa o relato vazio sem code, como a validacao do modelo', () => {
    // Act
    const outcome = createReport({ jogadorId: 1003, texto: '  ', observadoEm: '2026-11-24T00:00:00-03:00' }, NOW)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 400 })
  })
})

describe('editReport', () => {
  it('aplica a edicao parcial, substitui as listas e sobe a versao', () => {
    // Act
    const outcome = editReport(REPORT_IDS.looseDraft, '"2"', { nota: 8, pontosNegativos: ['Pouco jogo aéreo'] })

    // Assert
    expect(outcome).toMatchObject({
      ok: true,
      report: { nota: 8, parecer: 'Monitorar', pontosNegativos: ['Pouco jogo aéreo'], version: 3 },
    })
  })

  it('exige o If-Match', () => {
    // Act
    const outcome = editReport(REPORT_IDS.looseDraft, null, { nota: 8 })

    // Assert
    expect(outcome).toEqual({ ok: false, status: 428 })
  })

  it('recusa a versao velha', () => {
    // Act
    const outcome = editReport(REPORT_IDS.looseDraft, '"1"', { nota: 8 })

    // Assert
    expect(outcome).toEqual({ ok: false, status: 412, code: 'relatorio.alterado_por_outra_requisicao' })
  })

  it('recusa editar o finalizado antes de olhar a versao', () => {
    // Act
    const outcome = editReport(REPORT_IDS.original, '"1"', { nota: 8 })

    // Assert
    expect(outcome).toEqual({ ok: false, status: 409, code: 'relatorio.ja_finalizado' })
  })

  it('recusa o relatorio inexistente', () => {
    // Act
    const outcome = editReport(REPORT_IDS.missing, '"1"', { nota: 8 })

    // Assert
    expect(outcome).toEqual({ ok: false, status: 404, code: 'relatorio.nao_encontrado' })
  })

  it('recusa a nota fora da faixa', () => {
    // Act
    const outcome = editReport(REPORT_IDS.looseDraft, '"2"', { nota: 11 })

    // Assert
    expect(outcome).toEqual({ ok: false, status: 400, code: 'nota.fora_da_faixa' })
  })
})

describe('finalizeReport', () => {
  it('finaliza o rascunho completo e troca a data de escrita', () => {
    // Arrange
    editReport(REPORT_IDS.looseDraft, '"2"', {
      pontosPositivos: ['Recebe de costas e gira rápido', 'Leitura entre as linhas'],
      pontosNegativos: ['Cai de produção', 'Evita a disputa aérea'],
    })

    // Act
    const outcome = finalizeReport(REPORT_IDS.looseDraft, '"3"', NOW)

    // Assert
    expect(outcome).toMatchObject({
      ok: true,
      report: { status: 'Finalizado', version: 4, escritoEm: NOW.toISOString(), finalizadoEm: NOW.toISOString() },
    })
  })

  it('recusa finalizar sem nota ou parecer', () => {
    // Act
    const outcome = finalizeReport(REPORT_IDS.correctionDraft, '"1"', NOW)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 422, code: 'relatorio.conclusao_ausente' })
  })

  it('recusa finalizar sem o conteudo minimo', () => {
    // Act
    const outcome = finalizeReport(REPORT_IDS.looseDraft, '"2"', NOW)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 422, code: 'relatorio.conteudo_minimo_nao_atendido' })
  })

  it('exige o If-Match', () => {
    // Act
    const outcome = finalizeReport(REPORT_IDS.looseDraft, null, NOW)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 428 })
  })
})

describe('correctReport', () => {
  it('abre a correcao herdando o jogador e a data da observacao', () => {
    // Act
    const outcome = correctReport(REPORT_IDS.current1002, 'Relato da correção', NOW)

    // Assert
    expect(outcome).toMatchObject({
      ok: true,
      report: {
        jogadorId: 1002,
        status: 'Rascunho',
        texto: 'Relato da correção',
        observadoEm: findReport(REPORT_IDS.current1002)?.observadoEm,
        corrigeRelatorioId: REPORT_IDS.current1002,
        version: 1,
      },
    })
  })

  it('recusa corrigir um rascunho', () => {
    // Act
    const outcome = correctReport(REPORT_IDS.looseDraft, 'Relato', NOW)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 409, code: 'relatorio.correcao_de_rascunho' })
  })
})

describe('resetReportStore', () => {
  it('volta ao estado semeado', () => {
    // Arrange
    createReport({ jogadorId: 1003, texto: 'Relato', observadoEm: '2026-11-24T00:00:00-03:00' }, NOW)

    // Act
    resetReportStore()

    // Assert
    expect(listReports(1003)).toEqual([])
  })
})
