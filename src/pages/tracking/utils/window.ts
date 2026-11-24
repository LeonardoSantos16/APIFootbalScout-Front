import type { TrackingWindow } from '../interfaces/tracking'

const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

const MEASURED_TODAY = 'Linha de base medida hoje'

const elapsedText = (days: number) =>
  days === 1 ? 'comparando o último dia' : `comparando os últimos ${days} dias`

export const windowText = ({ de, duracaoEmDias }: TrackingWindow): string => {
  const days = Math.floor(duracaoEmDias)
  if (days < 1) return MEASURED_TODAY
  return `Linha de base de ${DATE_FORMAT.format(new Date(de))} · ${elapsedText(days)}`
}
