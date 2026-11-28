import type { components } from '../api/schema'

type Schemas = components['schemas']

export type ShortlistResponse = Schemas['ShortlistResponseDto']
export type Money = Schemas['DinheiroDto']
