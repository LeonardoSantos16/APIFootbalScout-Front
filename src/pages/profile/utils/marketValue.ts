import type { PlayerDetails } from '../../../interfaces/player'
import { formatMoney } from '../../../utils/number'

export const marketValue = (details: PlayerDetails): string | undefined => {
  const raw = details.proposedMarketValueRaw
  return raw && raw.value > 0 ? formatMoney(raw.value, raw.currency) : undefined
}
