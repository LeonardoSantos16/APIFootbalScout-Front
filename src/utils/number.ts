const LOCALE = 'pt-BR'

export const formatDecimal = (value: number, digits: number): string =>
  new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)

export const formatPercent = (value: number): string => `${formatDecimal(value, 1)}%`

export const formatMinutes = (minutes: number): string =>
  `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(minutes)} min`
