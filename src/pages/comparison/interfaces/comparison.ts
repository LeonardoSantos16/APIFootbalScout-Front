import type { components } from '../../../api/schema'
import type { AttributeType } from '../../../interfaces/attribute'

type Schemas = components['schemas']

export type ComparisonResponse = Schemas['ComparacaoDiretaResponseDto']

export type ComparedValue = Schemas['ValorComparadoDto']

export type ComparisonRefusalReason = Schemas['MotivoDaRecusaDaComparacaoDto']

export type CellTone = 'strong' | 'muted' | 'neutral' | 'refused'

export interface ComparisonCell {
  text: string
  tone: CellTone
}

export interface ComparisonRow {
  type: AttributeType
  label: string
  cells: [ComparisonCell, ComparisonCell]
}

export interface ComparisonColumn {
  name: string
  detail?: string
}

export interface ComparisonTableData {
  columns: [ComparisonColumn, ComparisonColumn]
  rows: ComparisonRow[]
}

export interface RefusedPlayer {
  name: string
  position: string
}

export interface ComparisonPlayers {
  pageId: number
  otherId: number
}

export interface ComparisonFailure {
  message: string
  canRetry: boolean
  notFound: boolean
}
