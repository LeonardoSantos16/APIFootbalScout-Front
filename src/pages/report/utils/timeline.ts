import { formatDecimal } from '../../../utils/number'
import type { ReportResponse, ReportStatus, TimelineGroup, TimelineItem } from '../interfaces/report'
import { formatDate } from './reportDates'

const time = (iso: string) => new Date(iso).getTime()

const byWritingDate = (left: ReportResponse, right: ReportResponse) => time(left.escritoEm) - time(right.escritoEm)

const isFinalized = (report: ReportResponse) => report.status === 'Finalizado'

const latest = (reports: ReportResponse[]) => [...reports].sort(byWritingDate).at(-1)

const rootOf = (report: ReportResponse, byId: Map<string, ReportResponse>) => {
  const seen = new Set([report.relatorioId])
  let current = report
  while (current.corrigeRelatorioId) {
    const parent = byId.get(current.corrigeRelatorioId)
    if (!parent || seen.has(parent.relatorioId)) break
    seen.add(parent.relatorioId)
    current = parent
  }
  return current
}

const titleOf = (report: ReportResponse) =>
  report.corrigeRelatorioId
    ? `Correção de ${formatDate(report.escritoEm)}`
    : `Observado em ${formatDate(report.observadoEm)}`

const detailOf = (report: ReportResponse) => {
  const rating = report.nota == null ? 'Sem nota' : `${formatDecimal(report.nota, 1)} de 10`
  return `${rating} · ${report.parecer ?? 'Sem parecer'}`
}

const buildItem = (report: ReportResponse, members: ReportResponse[], currentId?: string): TimelineItem => {
  const children = members.filter((member) => member.corrigeRelatorioId === report.relatorioId)
  const status: ReportStatus = !isFinalized(report) ? 'draft' : report.relatorioId === currentId ? 'current' : 'finalized'
  const replacement = isFinalized(report) ? latest(children.filter(isFinalized)) : undefined
  const pendingCorrection = status === 'current' ? children.find((child) => !isFinalized(child)) : undefined

  return {
    id: report.relatorioId,
    title: titleOf(report),
    detail: detailOf(report),
    status,
    ...(replacement && {
      note: `Corrigido pela correção de ${formatDate(replacement.escritoEm)}`,
      replacedById: replacement.relatorioId,
    }),
    ...(pendingCorrection && { pendingCorrectionId: pendingCorrection.relatorioId }),
  }
}

export const buildTimeline = (reports: ReportResponse[]): TimelineGroup[] => {
  const byId = new Map(reports.map((report) => [report.relatorioId, report]))
  const groups = new Map<string, { root: ReportResponse; members: ReportResponse[] }>()

  for (const report of reports) {
    const root = rootOf(report, byId)
    const group = groups.get(root.relatorioId) ?? { root, members: [] }
    group.members.push(report)
    groups.set(root.relatorioId, group)
  }

  return [...groups.values()]
    .sort((left, right) => time(right.root.observadoEm) - time(left.root.observadoEm))
    .map(({ root, members }) => {
      const ordered = [...members].sort(byWritingDate)
      const currentId = latest(ordered.filter(isFinalized))?.relatorioId
      return {
        id: root.relatorioId,
        label: `Relatório observado em ${formatDate(root.observadoEm)}`,
        items: ordered.map((report) => buildItem(report, ordered, currentId)),
      }
    })
}
