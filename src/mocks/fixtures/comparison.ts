import type { components } from '../../api/schema'
import type { AttributeType } from '../../interfaces/attribute'
import type { Position } from '../../interfaces/player'
import { ATTRIBUTE_ORDER } from '../../utils/attributes'
import { BRASILEIRAO, SEASON_2025 } from './profiles'

type Schemas = components['schemas']

type Response = Schemas['ComparacaoDiretaResponseDto']
type Value = Schemas['ValorComparadoDto']
type Values = Record<AttributeType, Value>
type Recorte = Schemas['RecorteDto']

interface ComparedPlayer {
  name: string
  position?: Position
}

export const COMPARED_PLAYERS: Record<number, ComparedPlayer> = {
  1001: { name: 'Rafael Montes', position: 'MeioCampo' },
  1002: { name: 'Caio Ventura', position: 'Ataque' },
  1003: { name: 'Lucas Prado', position: 'Defesa' },
  1004: { name: 'Pedro Nunes', position: 'Goleiro' },
  1005: { name: 'Bruno Lacerda', position: 'MeioCampo' },
  1006: { name: 'Diego Albuquerque', position: 'Ataque' },
  1007: { name: 'Miguel Torres' },
}

const calculated = (valor: number, amostraEmMinutos: number): Value => ({
  resultado: 'Calculada',
  valor,
  amostraEmMinutos,
})

const notPublished = (): Value => ({ resultado: 'Recusada', motivo: 'FonteNaoAtribuiu' })

const values = (numbers: number[], sample: number): Values =>
  Object.fromEntries(ATTRIBUTE_ORDER.map((type, index) => [type, calculated(numbers[index], sample)])) as Values

export const VALUES_BY_PLAYER: Record<number, Values> = {
  1001: values([0.19, 0.14, 1.22, 2.1, 0.94, 7.12, 87.4], 1284),
  1006: values([0.46, 0.12, 0.85, 0.73, 0.94, 7.05, 74.1], 2340),
  1005: { ...values([0.06, 0.26, 1.66, 1.4, 0.51, 7.3, 0], 1410), PrecisaoDePasse: notPublished() },
}

const GENERIC_VALUES = values([0.25, 0.18, 1.05, 1.6, 0.8, 6.9, 81.2], 1500)

export const DEFAULT_RECORTE: Recorte = { competicaoId: BRASILEIRAO.id, temporadaId: SEASON_2025, contexto: 'Clube' }

const playerEntry = (id: number): Schemas['JogadorNaComparacaoDto'] => {
  const player = COMPARED_PLAYERS[id] ?? { name: `Jogador ${id}`, position: 'MeioCampo' }
  return player.position ? { nome: player.name, posicao: player.position } : { nome: player.name }
}

const jogadores = (pageId: number, otherId: number) => ({
  [String(pageId)]: playerEntry(pageId),
  [String(otherId)]: playerEntry(otherId),
})

export const realizedComparison = (pageId = 1001, otherId = 1006, recorte = DEFAULT_RECORTE): Response => {
  const pageValues = VALUES_BY_PLAYER[pageId] ?? GENERIC_VALUES
  const otherValues = VALUES_BY_PLAYER[otherId] ?? GENERIC_VALUES
  return {
    resultado: 'Realizada',
    jogadores: jogadores(pageId, otherId),
    recorte,
    atributos: ATTRIBUTE_ORDER.map((tipo) => ({
      tipo,
      valores: { [String(pageId)]: pageValues[tipo], [String(otherId)]: otherValues[tipo] },
    })),
  }
}

export const refusedComparison = (
  motivo: Schemas['MotivoDaRecusaDaComparacaoDto'],
  pageId = 1001,
  otherId = 1004,
): Response => ({ resultado: 'Recusada', motivo, jogadores: jogadores(pageId, otherId) })
