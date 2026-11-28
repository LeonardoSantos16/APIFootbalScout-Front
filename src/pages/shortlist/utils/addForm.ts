import type {
  AddFormChoices,
  AddFormView,
  MarketValue,
  ShortlistResponse,
} from '../interfaces/shortlist'
import { defaultPriority, defaultShortlist, priorityOptions, shortlistOptions } from './addOptions'
import { initialCurrency, millionsInput } from './cost'
import { listCurrency } from './shortlists'

export const FIRST_CURRENCY_HINT = 'O primeiro alvo define a moeda da lista.'

export const lockedCurrencyHint = (currency: string): string => `A moeda da lista é ${currency}.`

export const withCreated = (shortlists: ShortlistResponse[], created?: ShortlistResponse): ShortlistResponse[] =>
  created && !shortlists.some((shortlist) => shortlist.shortlistId === created.shortlistId)
    ? [...shortlists, created]
    : shortlists

export const resolveAddForm = (
  shortlists: ShortlistResponse[],
  playerId: number,
  marketValue: MarketValue | null | undefined,
  choices: AddFormChoices,
): AddFormView => {
  const options = shortlistOptions(shortlists, playerId)
  const chosen = options.find((option) => option.value === choices.shortlistId && !option.disabled)
  const selectedId = chosen?.value ?? defaultShortlist(options)
  const selected = shortlists.find((shortlist) => shortlist.shortlistId === selectedId)
  const locked = selected ? listCurrency(selected) : undefined
  const currency = locked ?? choices.currency ?? initialCurrency(marketValue)
  const count = selected?.alvos.length ?? 0
  const priority =
    choices.priority && choices.priority.shortlistId === selectedId ? choices.priority.value : defaultPriority(count)

  return {
    options,
    selected,
    currency,
    lockedCurrency: Boolean(locked),
    currencyHint: locked ? lockedCurrencyHint(locked) : FIRST_CURRENCY_HINT,
    cost: choices.cost ?? millionsInput(marketValue, currency),
    priorityOptions: priorityOptions(count),
    priority,
  }
}
