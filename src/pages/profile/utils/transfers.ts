import type { components } from '../../../api/schema'
import type { Row } from '../../../components/RowList/RowList'
import { formatMoney } from '../../../utils/number'

type Transfer = components['schemas']['SofaTransfer']

const FEE_DESCRIPTION: Record<string, string> = {
  free: 'Livre',
  'free transfer': 'Livre',
  loan: 'Empréstimo',
  'end of loan': 'Fim de empréstimo',
}

const MONTHS = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']

export const formatMonthYear = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

export const transferFee = (transfer: Transfer): string | undefined => {
  const raw = transfer.transferFeeRaw
  if (raw && raw.value > 0) return formatMoney(raw.value, raw.currency)
  const description = transfer.transferFeeDescription?.trim().toLowerCase()
  return description ? FEE_DESCRIPTION[description] : undefined
}

const teamName = (name: string | undefined, fallback: { name?: string } | undefined) => name || fallback?.name || ''

export const transferRows = (history: Transfer[] | null | undefined): Row[] =>
  [...(history ?? [])]
    .sort((a, b) => b.transferDateTimestamp - a.transferDateTimestamp)
    .map((transfer) => ({
      id: String(transfer.id),
      title: `${teamName(transfer.fromTeamName, transfer.transferFrom)} → ${teamName(transfer.toTeamName, transfer.transferTo)}`,
      detail: [formatMonthYear(transfer.transferDateTimestamp), transferFee(transfer)].filter(Boolean).join(' · '),
    }))
