import type { DescribedError } from '../../../api/errors'
import type { components } from '../../../api/schema'
import type { ChangeDirection } from '../../../components/ChangeChip/ChangeChip'

type Schemas = components['schemas']

export type TrackingResponse = Schemas['ConsultarMudancaAcompanhamentoResponseDto']
export type TrackingWindow = Schemas['JanelaDaComparacaoDto']
export type MeasurementState = Schemas['ResultadoDaAfericaoDto']

export interface MeasurementChange {
  direction: ChangeDirection
  text: string
}

export interface Measurement {
  title: string
  state: MeasurementState
  previous?: string
  current?: string
  change?: MeasurementChange
  reason?: string
}

export type OpeningFailurePlacement = 'replace' | 'below'

export interface OpeningFailure extends DescribedError {
  placement: OpeningFailurePlacement
}

export interface TrackingView {
  window: string
  measurements: Measurement[]
}
