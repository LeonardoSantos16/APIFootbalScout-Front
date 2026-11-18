import { MIN_SAMPLE_MINUTES } from '../config/scout'
import type { Attribute, AttributeType } from '../interfaces/attribute'
import { formatDecimal, formatMinutes, formatPercent } from './number'

export class IncompleteResponseError extends Error {
  constructor(type: AttributeType) {
    super(`Atributo ausente ou sem valor: ${type}`)
    this.name = 'IncompleteResponseError'
  }
}

export const ATTRIBUTE_ORDER: AttributeType[] = [
  'Gols',
  'Assistencias',
  'PassesDecisivos',
  'Desarmes',
  'Interceptacoes',
  'Rating',
  'PrecisaoDePasse',
]

export const ATTRIBUTE_LABEL: Record<AttributeType, string> = {
  Gols: 'Gols, por 90',
  Assistencias: 'Assistências, por 90',
  PassesDecisivos: 'Passes decisivos, por 90',
  Desarmes: 'Desarmes, por 90',
  Interceptacoes: 'Interceptações, por 90',
  Rating: 'Nota, média',
  PrecisaoDePasse: 'Precisão de passe',
}

export const formatAttributeValue = (type: AttributeType, value: number) =>
  type === 'PrecisaoDePasse' ? formatPercent(value) : formatDecimal(value, 2)

export const MINIMUM_SAMPLE_TEXT = formatMinutes(MIN_SAMPLE_MINUTES)

type RefusableValue = Pick<Attribute, 'motivo' | 'amostraEmMinutos'>

export const refusalText = (value: RefusableValue): string => {
  if (value.motivo === 'FonteNaoAtribuiu') return 'Não publicado pela fonte'
  if (value.amostraEmMinutos == null) return `Amostra insuficiente: mínimo de ${MINIMUM_SAMPLE_TEXT}`
  const sample = formatDecimal(value.amostraEmMinutos, 0)
  return `Amostra insuficiente: ${sample} de ${MINIMUM_SAMPLE_TEXT}`
}

export const commonSample = (values: RefusableValue[]): number | undefined => {
  const counts = new Map<number, number>()
  for (const { amostraEmMinutos } of values) {
    if (amostraEmMinutos == null) continue
    counts.set(amostraEmMinutos, (counts.get(amostraEmMinutos) ?? 0) + 1)
  }
  const [mostCommon] = [...counts].sort(
    ([sampleA, countA], [sampleB, countB]) => countB - countA || sampleB - sampleA,
  )
  return mostCommon?.[0]
}
