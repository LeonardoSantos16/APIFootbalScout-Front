import type { components } from '../../../api/schema'

type Schemas = components['schemas']

export type ReportResponse = Schemas['RelatorioResponseDto']
export type Verdict = Schemas['ParecerDto']
export type ReportEdit = Schemas['EditarRascunhoRelatorioRequestDto']

export type ReportStatus = 'draft' | 'finalized' | 'current'

export interface TimelineItem {
  id: string
  title: string
  detail: string
  status: ReportStatus
  note?: string
  pendingCorrectionId?: string
}

export interface TimelineGroup {
  id: string
  label: string
  items: TimelineItem[]
}

export interface ReportForm {
  observation: string
  narrative: string
  rating: string
  verdict: Verdict | null
  positivePoints: string[]
  negativePoints: string[]
}

export type RatingResult =
  | { kind: 'empty' }
  | { kind: 'valid'; value: number }
  | { kind: 'invalid'; message: string }

export interface FormErrors {
  narrative?: string
  rating?: string
}

export interface ChecklistItem {
  label: string
  done: boolean
  progress?: string
}

export type WriteFailurePlacement = 'notice' | 'buttons'

export interface WriteFailure {
  message: string
  placement: WriteFailurePlacement
}
