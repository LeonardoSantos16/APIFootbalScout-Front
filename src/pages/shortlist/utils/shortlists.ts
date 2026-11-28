import type { NameCheck, ShortlistResponse } from '../interfaces/shortlist'

export const NAME_REQUIRED = 'Dê um nome à shortlist.'

export const listCurrency = (shortlist: ShortlistResponse): string | undefined =>
  shortlist.alvos[0]?.custoEstimado.moeda

export const isFull = (shortlist: ShortlistResponse): boolean => shortlist.alvos.length >= shortlist.limiteDeAlvos

export const validateName = (name: string): NameCheck => {
  const trimmed = name.trim()
  return trimmed ? { ok: true, name: trimmed } : { ok: false, error: NAME_REQUIRED }
}

export const fullText = (shortlist: ShortlistResponse): string =>
  `A shortlist atingiu o limite de ${shortlist.limiteDeAlvos} alvos.`
