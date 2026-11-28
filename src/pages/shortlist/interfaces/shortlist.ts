import type { ReactNode } from 'react'
import type { components } from '../../../api/schema'

type Schemas = components['schemas']

export type ShortlistResponse = Schemas['ShortlistResponseDto']
export type TargetResponse = Schemas['AlvoResponseDto']
export type Money = Schemas['DinheiroDto']
export type MarketValue = Schemas['SofaMarketValue']

export type CostParse = { ok: true; cents: number } | { ok: false; error: string }

export type NameCheck = { ok: true; name: string } | { ok: false; error: string }

export interface ShortlistOption {
  value: string
  label: string
  disabled: boolean
}

export interface PriorityOption {
  value: string
  label: string
}

export interface AddFormChoices {
  shortlistId?: string
  priority?: { shortlistId: string; value: string }
  currency?: string
  cost?: string
}

export interface AddFormView {
  options: ShortlistOption[]
  selected?: ShortlistResponse
  currency: string
  lockedCurrency: boolean
  currencyHint: string
  cost: string
  priorityOptions: PriorityOption[]
  priority: string
}

export type TargetWrite =
  | { kind: 'move'; playerId: number; priority: number }
  | { kind: 'remove'; playerId: number }

export interface ShortlistLinkProps {
  className: string
  children: ReactNode
}
