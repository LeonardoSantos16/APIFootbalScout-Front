import type { ComparisonFailure } from '../interfaces/comparison'

interface FailureContext {
  otherName?: string
  sliceText: string
}

export const describeComparisonError = (_error: unknown, _context: FailureContext): ComparisonFailure => {
  throw new Error('not implemented')
}
