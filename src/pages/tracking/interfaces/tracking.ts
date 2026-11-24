import type { DescribedError } from '../../../api/errors'
import type { components } from '../../../api/schema'

type Schemas = components['schemas']

export type TrackingResponse = Schemas['ConsultarMudancaAcompanhamentoResponseDto']
export type TrackingWindow = Schemas['JanelaDaComparacaoDto']
export type MeasurementState = Schemas['ResultadoDaAfericaoDto']
export type ChangeDirection = 'up' | 'down'

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
