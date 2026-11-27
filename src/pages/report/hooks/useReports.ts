import { useQuery } from '@tanstack/react-query'
import type { ReportResponse, TimelineGroup } from '../interfaces/report'
import { buildTimeline } from '../utils/timeline'
import { reportsQuery } from './reportQueries'

export interface ReportsView {
  reports: ReportResponse[]
  groups: TimelineGroup[]
}

const toView = (reports: ReportResponse[]): ReportsView => ({ reports, groups: buildTimeline(reports) })

export const useReports = (playerId: number) => useQuery({ ...reportsQuery(playerId), select: toView })
