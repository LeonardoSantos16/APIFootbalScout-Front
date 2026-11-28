export const APP_NAME = 'APIFootballScout'

const SEPARATOR = ' · '

export const documentTitle = (...parts: (string | undefined)[]): string =>
  [...parts.map((part) => part?.trim()).filter(Boolean), APP_NAME].join(SEPARATOR)
