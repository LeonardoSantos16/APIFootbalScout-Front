import type { components } from '../api/schema'
import { MIN_NEGATIVE_POINTS, MIN_POINTS_CHARACTERS, MIN_POSITIVE_POINTS } from '../config/scout'
import { seededReports } from './fixtures/reports'

type Schemas = components['schemas']
type Report = Schemas['RelatorioResponseDto']

export type ReportOutcome = { ok: true; report: Report } | { ok: false; status: number; code?: string }

const MIN_RATING = 0
const MAX_RATING = 10
const STRONG_ETAG = /^"(\d+)"$/

const seed = () => new Map(seededReports().map((report) => [report.relatorioId, report]))

const state = { reports: seed() }

export const resetReportStore = () => {
  state.reports = seed()
}

const refuse = (status: number, code?: string): ReportOutcome => (code ? { ok: false, status, code } : { ok: false, status })

const save = (report: Report): ReportOutcome => {
  state.reports.set(report.relatorioId, report)
  return { ok: true, report }
}

const time = (iso: string) => new Date(iso).getTime()

const expectedVersion = (ifMatch: string | null) => {
  const match = ifMatch ? STRONG_ETAG.exec(ifMatch.trim()) : null
  return match ? Number(match[1]) : undefined
}

const hasMinimumContent = (report: Report) =>
  report.pontosPositivos.length >= MIN_POSITIVE_POINTS &&
  report.pontosNegativos.length >= MIN_NEGATIVE_POINTS &&
  [...report.pontosPositivos, ...report.pontosNegativos].reduce((total, point) => total + point.length, 0) >=
    MIN_POINTS_CHARACTERS

const ratingRefusal = (nota: number | null | undefined) => {
  if (nota == null) return undefined
  if (nota < MIN_RATING || nota > MAX_RATING) return refuse(400, 'nota.fora_da_faixa')
  if (Math.round(nota * 10) !== nota * 10) return refuse(400, 'nota.precisao_invalida')
  return undefined
}

export const listReports = (playerId: number): Report[] =>
  [...state.reports.values()]
    .filter((report) => report.jogadorId === playerId)
    .sort((left, right) => time(right.observadoEm) - time(left.observadoEm))

export const findReport = (id: string): Report | undefined => state.reports.get(id)

export const createReport = (
  request: Schemas['AbrirRascunhoRelatorioRequestDto'],
  now = new Date(),
): ReportOutcome => {
  if (!request.texto.trim()) return refuse(400)
  if (!request.jogadorId || request.jogadorId <= 0) return refuse(409, 'relatorio.jogador_invalido')
  if (time(request.observadoEm) > now.getTime()) return refuse(409, 'relatorio.observacao_futura')
  return save({
    relatorioId: crypto.randomUUID(),
    jogadorId: request.jogadorId,
    status: 'Rascunho',
    texto: request.texto,
    observadoEm: request.observadoEm,
    escritoEm: now.toISOString(),
    pontosPositivos: [],
    pontosNegativos: [],
    version: 1,
  })
}

export const editReport = (
  id: string,
  ifMatch: string | null,
  edit: Schemas['EditarRascunhoRelatorioRequestDto'],
): ReportOutcome => {
  const version = expectedVersion(ifMatch)
  if (version === undefined) return refuse(428)
  const report = findReport(id)
  if (!report) return refuse(404, 'relatorio.nao_encontrado')
  if (report.status === 'Finalizado') return refuse(409, 'relatorio.ja_finalizado')
  if (edit.texto != null && !edit.texto.trim()) return refuse(400, 'relatorio.texto_obrigatorio')
  const rating = ratingRefusal(edit.nota)
  if (rating) return rating
  if (report.version !== version) return refuse(412, 'relatorio.alterado_por_outra_requisicao')
  return save({
    ...report,
    texto: edit.texto ?? report.texto,
    nota: edit.nota ?? report.nota,
    parecer: edit.parecer ?? report.parecer,
    pontosPositivos: edit.pontosPositivos ?? report.pontosPositivos,
    pontosNegativos: edit.pontosNegativos ?? report.pontosNegativos,
    version: report.version + 1,
  })
}

export const finalizeReport = (id: string, ifMatch: string | null, now = new Date()): ReportOutcome => {
  const version = expectedVersion(ifMatch)
  if (version === undefined) return refuse(428)
  const report = findReport(id)
  if (!report) return refuse(404, 'relatorio.nao_encontrado')
  if (report.status === 'Finalizado') return refuse(409, 'relatorio.ja_finalizado')
  if (report.nota == null || report.parecer == null) return refuse(422, 'relatorio.conclusao_ausente')
  if (!hasMinimumContent(report)) return refuse(422, 'relatorio.conteudo_minimo_nao_atendido')
  if (report.version !== version) return refuse(412, 'relatorio.alterado_por_outra_requisicao')
  const finalizedAt = now.toISOString()
  return save({ ...report, status: 'Finalizado', escritoEm: finalizedAt, finalizadoEm: finalizedAt, version: report.version + 1 })
}

export const correctReport = (id: string, texto: string, now = new Date()): ReportOutcome => {
  if (!texto.trim()) return refuse(400)
  const original = findReport(id)
  if (!original) return refuse(404, 'relatorio.nao_encontrado')
  if (original.status !== 'Finalizado') return refuse(409, 'relatorio.correcao_de_rascunho')
  return save({
    relatorioId: crypto.randomUUID(),
    jogadorId: original.jogadorId,
    status: 'Rascunho',
    texto,
    observadoEm: original.observadoEm,
    escritoEm: now.toISOString(),
    pontosPositivos: [],
    pontosNegativos: [],
    corrigeRelatorioId: original.relatorioId,
    version: 1,
  })
}
