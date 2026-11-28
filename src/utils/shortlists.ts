import type { Money, ShortlistResponse } from '../interfaces/shortlist'
import { formatMoney } from './number'

export const sortByName = (shortlists: ShortlistResponse[]): ShortlistResponse[] =>
  [...shortlists].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

export const targetsCount = (shortlist: ShortlistResponse): string =>
  `${shortlist.alvos.length} de ${shortlist.limiteDeAlvos}`

export const targetsLabel = (shortlist: ShortlistResponse): string => `${targetsCount(shortlist)} alvos`

export const formatCost = (money: Money): string => formatMoney(money.quantiaEmCentavos / 100, money.moeda)
