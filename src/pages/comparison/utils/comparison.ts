import type { AttributeType } from '../../../interfaces/attribute'
import {
  ATTRIBUTE_LABEL,
  ATTRIBUTE_ORDER,
  IncompleteResponseError,
  commonSample,
  formatAttributeValue,
  refusalText,
} from '../../../utils/attributes'
import { formatMinutes } from '../../../utils/number'
import { positionLabel } from '../../../utils/player'
import type {
  ComparedValue,
  ComparisonCell,
  ComparisonColumn,
  ComparisonPlayers,
  ComparisonResponse,
  ComparisonRow,
  ComparisonTableData,
} from '../interfaces/comparison'

const SEPARATOR = ' · '

const valuesOf = (response: ComparisonResponse, playerId: number): ComparedValue[] =>
  (response.atributos ?? []).flatMap((attribute) => {
    const value = attribute.valores[String(playerId)]
    return value ? [value] : []
  })

const column = (response: ComparisonResponse, playerId: number): ComparisonColumn => {
  const player = response.jogadores[String(playerId)]
  const sample = commonSample(valuesOf(response, playerId))
  const detail = [positionLabel(player?.posicao), sample != null ? formatMinutes(sample) : undefined]
    .filter(Boolean)
    .join(SEPARATOR)
  return { name: player?.nome ?? '', detail: detail || undefined }
}

const valueOf = (response: ComparisonResponse, type: AttributeType, playerId: number): ComparedValue => {
  const attribute = response.atributos?.find((item) => item.tipo === type)
  const value = attribute?.valores[String(playerId)]
  if (!value) throw new IncompleteResponseError(type)
  if (value.resultado === 'Calculada' && value.valor == null) throw new IncompleteResponseError(type)
  return value
}

const isCalculated = (value: ComparedValue): value is ComparedValue & { valor: number } =>
  value.resultado === 'Calculada' && value.valor != null

const cellsOf = (type: AttributeType, page: ComparedValue, other: ComparedValue): [ComparisonCell, ComparisonCell] => {
  const text = (value: ComparedValue) =>
    isCalculated(value) ? formatAttributeValue(type, value.valor) : refusalText(value)

  if (!isCalculated(page) || !isCalculated(other)) {
    const tone = (value: ComparedValue) => (isCalculated(value) ? 'neutral' : 'refused')
    return [
      { text: text(page), tone: tone(page) },
      { text: text(other), tone: tone(other) },
    ]
  }

  const pageText = text(page)
  const otherText = text(other)
  if (pageText === otherText) {
    return [
      { text: pageText, tone: 'neutral' },
      { text: otherText, tone: 'neutral' },
    ]
  }

  const pageAhead = page.valor > other.valor
  return [
    { text: pageText, tone: pageAhead ? 'strong' : 'muted' },
    { text: otherText, tone: pageAhead ? 'muted' : 'strong' },
  ]
}

export const buildComparison = (response: ComparisonResponse, players: ComparisonPlayers): ComparisonTableData => {
  const rows = ATTRIBUTE_ORDER.map(
    (type): ComparisonRow => ({
      type,
      label: ATTRIBUTE_LABEL[type],
      cells: cellsOf(type, valueOf(response, type, players.pageId), valueOf(response, type, players.otherId)),
    }),
  )
  return { columns: [column(response, players.pageId), column(response, players.otherId)], rows }
}
