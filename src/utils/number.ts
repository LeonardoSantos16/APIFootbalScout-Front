const LOCALE = 'pt-BR'

export const formatDecimal = (value: number, digits: number): string =>
  new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)

export const formatPercent = (value: number): string => `${formatDecimal(value, 1)}%`

export const formatMinutes = (minutes: number): string =>
  `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(minutes)} min`

const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: '€',
  USD: 'US$',
  BRL: 'R$',
  GBP: '£',
}

const MILLION = 1_000_000
const THOUSAND = 1_000

const formatUpTo = (value: number, digits: number): string =>
  new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits }).format(value)

export const formatMoney = (value: number, currency: string): string => {
  const prefix = CURRENCY_SYMBOL[currency] ?? `${currency} `
  if (value >= MILLION) return `${prefix}${formatUpTo(value / MILLION, 1)}M`
  if (value >= THOUSAND) return `${prefix}${formatUpTo(value / THOUSAND, 0)} mil`
  return `${prefix}${formatUpTo(value, 0)}`
}
