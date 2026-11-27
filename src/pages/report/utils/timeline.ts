import type { ReportResponse, TimelineGroup } from '../interfaces/report'

export const buildTimeline = (reports: ReportResponse[]): TimelineGroup[] =>
  reports.map((report) => ({
    id: report.relatorioId,
    label: '',
    items: [{ id: report.relatorioId, title: '', detail: '', status: 'draft' }],
  }))
