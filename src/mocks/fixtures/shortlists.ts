import type { components } from '../../api/schema'

type Shortlist = components['schemas']['ShortlistResponseDto']
type Target = components['schemas']['AlvoResponseDto']

export const SHORTLIST_LIMIT = 25

export const SHORTLIST_IDS = {
  laterais: '70000000-0000-4000-8000-000000000001',
  meias: '70000000-0000-4000-8000-000000000002',
  atacantes: '70000000-0000-4000-8000-000000000003',
  conflito: '70000000-0000-4000-8000-000000000004',
  missing: '79999999-0000-4000-8000-000000000001',
} as const

export const PROFILE_SOURCE_DOWN_PLAYER = 1009

const MILLION_CENTS = 100_000_000

export const millions = (value: number, moeda = 'EUR') => ({
  quantiaEmCentavos: Math.round(value * MILLION_CENTS),
  moeda,
})

export const buildTargets = (entries: [jogadorId: number, millions: number][], moeda = 'EUR'): Target[] =>
  entries.map(([jogadorId, value], index) => ({
    jogadorId,
    prioridade: index + 1,
    custoEstimado: millions(value, moeda),
  }))

export const totalOf = (alvos: Target[]) =>
  alvos.length === 0
    ? undefined
    : {
        quantiaEmCentavos: alvos.reduce((sum, alvo) => sum + alvo.custoEstimado.quantiaEmCentavos, 0),
        moeda: alvos[0].custoEstimado.moeda,
      }

export const buildShortlist = (
  overrides: Partial<Shortlist> & Pick<Shortlist, 'shortlistId' | 'nome'>,
): Shortlist => {
  const alvos = overrides.alvos ?? []
  const total = totalOf(alvos)
  return {
    limiteDeAlvos: SHORTLIST_LIMIT,
    version: 1,
    ...overrides,
    alvos,
    ...(total ? { custoTotal: total } : {}),
  }
}

export const lateraisShortlist = (): Shortlist =>
  buildShortlist({
    shortlistId: SHORTLIST_IDS.laterais,
    nome: 'Laterais 2027',
    alvos: buildTargets([
      [1007, 8],
      [1001, 12.5],
      [1006, 22],
      [PROFILE_SOURCE_DOWN_PLAYER, 4.5],
    ]),
  })

export const meiasShortlist = (): Shortlist =>
  buildShortlist({ shortlistId: SHORTLIST_IDS.meias, nome: 'Meias para janeiro' })

const ATTACKERS_WITH_PROFILE = [1001, 1002, 1003, 1005, 1006, 1007, 1008]
const ATTACKERS_WITHOUT_PROFILE = Array.from({ length: SHORTLIST_LIMIT - ATTACKERS_WITH_PROFILE.length }, (_, index) => 2001 + index)

export const atacantesShortlist = (): Shortlist =>
  buildShortlist({
    shortlistId: SHORTLIST_IDS.atacantes,
    nome: 'Atacantes',
    alvos: buildTargets(
      [...ATTACKERS_WITH_PROFILE, ...ATTACKERS_WITHOUT_PROFILE].map((jogadorId, index): [number, number] => [
        jogadorId,
        10 + index * 0.5,
      ]),
    ),
  })

export const conflitoShortlist = (): Shortlist =>
  buildShortlist({
    shortlistId: SHORTLIST_IDS.conflito,
    nome: 'Conflito',
    alvos: buildTargets([
      [1005, 5],
      [1008, 4],
    ]),
  })

export const anaShortlists = (): Shortlist[] => [
  lateraisShortlist(),
  conflitoShortlist(),
  meiasShortlist(),
  atacantesShortlist(),
]
