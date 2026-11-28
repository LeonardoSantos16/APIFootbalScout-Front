import { formatMoney } from '../../../utils/number'
import type { CostParse, MarketValue, Money } from '../interfaces/shortlist'

export const CURRENCIES = ['EUR', 'BRL', 'USD', 'GBP']

export const COST_REQUIRED = 'Informe um custo maior que zero.'
export const COST_PRECISION = 'Use no máximo duas casas decimais.'

const CENTS_PER_MILLION = 100_000_000
const MILLION = 1_000_000
const MAX_DECIMALS = 2
const NUMBER_PATTERN = /^\d+(\.\d+)?$/

const millionsFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: MAX_DECIMALS, useGrouping: false })

export const parseMillions = (input: string): CostParse => {
  const text = input.trim().replace(',', '.')
  if (!NUMBER_PATTERN.test(text)) return { ok: false, error: COST_REQUIRED }
  const decimals = text.split('.')[1] ?? ''
  if (decimals.length > MAX_DECIMALS) return { ok: false, error: COST_PRECISION }
  const value = Number(text)
  if (value <= 0) return { ok: false, error: COST_REQUIRED }
  return { ok: true, cents: Math.round(value * CENTS_PER_MILLION) }
}

const usableMarketValue = (marketValue: MarketValue | null | undefined) =>
  marketValue && marketValue.value > 0 ? marketValue : undefined

export const millionsInput = (marketValue: MarketValue | null | undefined, currency: string): string => {
  const usable = usableMarketValue(marketValue)
  return usable && usable.currency === currency ? millionsFormat.format(usable.value / MILLION) : ''
}

export const initialCurrency = (marketValue: MarketValue | null | undefined, listCurrency?: string): string => {
  if (listCurrency) return listCurrency
  const usable = usableMarketValue(marketValue)
  return usable && CURRENCIES.includes(usable.currency) ? usable.currency : CURRENCIES[0]
}

export const formatCost = (money: Money): string => formatMoney(money.quantiaEmCentavos / 100, money.moeda)
