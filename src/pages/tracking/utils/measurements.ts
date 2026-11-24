import type { components } from '../../../api/schema'
import { formatDecimal, formatMinutes, formatMoney } from '../../../utils/number'
import type { Measurement, MeasurementChange, MeasurementState, TrackingResponse } from '../interfaces/tracking'

type Schemas = components['schemas']
type Money = Schemas['DinheiroDto']
type UnavailableReason = Schemas['MotivoDeIndisponibilidadeDto']

const MINUS = '−'

const REASON_TEXT: Record<UnavailableReason, string> = {
  MoedaInesperada: 'A fonte passou a publicar o valor em outra moeda; comparar seria enganoso.',
  TemporadaVirada: 'A temporada virou e a minutagem zerou. A leitura antiga não é comparável.',
}

interface MeasurementInput {
  title: string
  state: MeasurementState
  previous?: string
  current?: string
  change?: MeasurementChange
  reason?: UnavailableReason | null
}

const measurement = ({ title, state, previous, current, change, reason }: MeasurementInput): Measurement => {
  if (state === 'Indisponivel') return { title, state, ...(reason ? { reason: REASON_TEXT[reason] } : {}) }
  if (state === 'SemMudancaRelevante') return { title, state, ...(current ? { current } : {}) }
  return {
    title,
    state,
    ...(previous ? { previous } : {}),
    ...(current ? { current } : {}),
    ...(change ? { change } : {}),
  }
}

const formatAmount = (money?: Money | null) =>
  money ? formatMoney(money.quantiaEmCentavos / 100, money.moeda) : undefined

const formatCount = (value?: number | null) => (value === null || value === undefined ? undefined : formatDecimal(value, 0))

const minutesText = (value?: number | null) => (value === null || value === undefined ? undefined : formatMinutes(value))

const marketValueChange = (
  previous?: Money | null,
  current?: Money | null,
  percent?: number | null,
): MeasurementChange | undefined => {
  if (!previous || !current || percent === null || percent === undefined) return undefined
  const up = current.quantiaEmCentavos >= previous.quantiaEmCentavos
  const text = `${up ? '+' : MINUS}${formatDecimal(Math.abs(percent), 1)}% ${up ? 'alta' : 'queda'}`
  return { direction: up ? 'up' : 'down', text }
}

const minutesChange = (difference?: number | null): MeasurementChange | undefined => {
  if (difference === null || difference === undefined) return undefined
  const up = difference >= 0
  const text = `${up ? '+' : MINUS}${formatDecimal(Math.abs(difference), 0)} min ${up ? 'a mais' : 'a menos'}`
  return { direction: up ? 'up' : 'down', text }
}

export const buildMeasurements = ({ clube, valorDeMercado, minutagem }: TrackingResponse): Measurement[] => [
  measurement({
    title: 'Clube',
    state: clube.resultado,
    previous: clube.anterior ?? undefined,
    current: clube.atual ?? undefined,
    reason: clube.motivo,
  }),
  measurement({
    title: 'Valor de mercado',
    state: valorDeMercado.resultado,
    previous: formatAmount(valorDeMercado.anterior),
    current: formatAmount(valorDeMercado.atual),
    change: marketValueChange(
      valorDeMercado.anterior,
      valorDeMercado.atual,
      valorDeMercado.variacaoPercentualAbsoluta,
    ),
    reason: valorDeMercado.motivo,
  }),
  measurement({
    title: 'Minutagem',
    state: minutagem.resultado,
    previous: formatCount(minutagem.anterior),
    current: minutesText(minutagem.atual),
    change: minutesChange(minutagem.variacaoAbsoluta),
    reason: minutagem.motivo,
  }),
]
