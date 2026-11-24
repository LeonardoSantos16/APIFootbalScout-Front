import type { DescribedError } from '../../../api/errors'
import type { OpeningFailure } from '../interfaces/tracking'

export const isNotTracked = (_error: unknown): boolean => {
  throw new Error('not implemented')
}

export const isAlreadyTracked = (_error: unknown): boolean => {
  throw new Error('not implemented')
}

export const describeReadingError = (_error: unknown): DescribedError => {
  throw new Error('not implemented')
}

export const describeOpeningError = (_error: unknown): OpeningFailure => {
  throw new Error('not implemented')
}
