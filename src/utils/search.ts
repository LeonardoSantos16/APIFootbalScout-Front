export const SEARCH_TERM_MIN = 2

export const SHORT_TERM_MESSAGE = 'Digite pelo menos 2 letras do nome.'

export const normalizeTerm = (raw: unknown): string | undefined => {
  if (typeof raw !== 'string') return undefined
  const term = raw.trim()
  return term === '' ? undefined : term
}

export const isSearchableTerm = (term: string | undefined): term is string =>
  term !== undefined && term.length >= SEARCH_TERM_MIN

export const validateTerm = (raw: string): string | undefined =>
  isSearchableTerm(normalizeTerm(raw)) ? undefined : SHORT_TERM_MESSAGE
