import { beforeEach, describe, expect, it } from 'vitest'
import { SHORTLIST_IDS, millions } from './fixtures/shortlists'
import {
  addTarget,
  createShortlist,
  findShortlist,
  listShortlists,
  moveTarget,
  removeTarget,
  resetShortlistStore,
} from './shortlistStore'

const V1 = '"1"'

const order = (shortlistId: string) => findShortlist(shortlistId)?.alvos.map((alvo) => alvo.jogadorId)

beforeEach(() => {
  resetShortlistStore()
})

describe('listShortlists', () => {
  it('comeca com as quatro shortlists da Ana', () => {
    // Act
    const names = listShortlists().map((shortlist) => shortlist.nome)

    // Assert
    expect(names).toHaveLength(4)
    expect(names).toContain('Laterais 2027')
  })
})

describe('createShortlist', () => {
  it('cria uma shortlist vazia com o limite da politica', () => {
    // Act
    const outcome = createShortlist('Volantes 2027')

    // Assert
    expect(outcome.ok && outcome.shortlist).toMatchObject({ nome: 'Volantes 2027', limiteDeAlvos: 25, alvos: [], version: 1 })
    expect(outcome.ok && 'custoTotal' in outcome.shortlist).toBe(false)
  })

  it('recusa o nome vazio sem code', () => {
    // Act
    const outcome = createShortlist('')

    // Assert
    expect(outcome).toEqual({ ok: false, status: 400 })
  })
})

describe('addTarget', () => {
  it('insere no meio e renumera os alvos seguintes', () => {
    // Act
    const outcome = addTarget(SHORTLIST_IDS.laterais, V1, { jogadorId: 1005, prioridade: 2, custoEstimado: millions(3) })

    // Assert
    expect(outcome.ok).toBe(true)
    expect(order(SHORTLIST_IDS.laterais)).toEqual([1007, 1005, 1001, 1006, 1009])
    expect(findShortlist(SHORTLIST_IDS.laterais)).toMatchObject({ version: 2, custoTotal: millions(50) })
  })

  it('define a moeda da lista no primeiro alvo', () => {
    // Act
    const outcome = addTarget(SHORTLIST_IDS.meias, V1, { jogadorId: 1001, prioridade: 1, custoEstimado: millions(12.5, 'BRL') })

    // Assert
    expect(outcome.ok && outcome.shortlist.custoTotal).toEqual(millions(12.5, 'BRL'))
  })

  it.each([
    [{ jogadorId: 1001, prioridade: 1, custoEstimado: millions(1) }, 422, 'shortlist.jogador_ja_na_lista'],
    [{ jogadorId: 1005, prioridade: 1, custoEstimado: millions(1, 'BRL') }, 422, 'shortlist.moeda_divergente'],
    [{ jogadorId: 1005, prioridade: 6, custoEstimado: millions(1) }, 422, 'shortlist.prioridade_fora_da_ordem'],
    [{ jogadorId: 1005, prioridade: 0, custoEstimado: millions(1) }, 400, 'prioridade.nao_positiva'],
  ])('recusa %o com %i %s', (request, status, code) => {
    // Act
    const outcome = addTarget(SHORTLIST_IDS.laterais, V1, request)

    // Assert
    expect(outcome).toEqual({ ok: false, status, code })
  })

  it('recusa a shortlist cheia', () => {
    // Act
    const outcome = addTarget(SHORTLIST_IDS.atacantes, V1, { jogadorId: 3001, prioridade: 1, custoEstimado: millions(1) })

    // Assert
    expect(outcome).toEqual({ ok: false, status: 422, code: 'shortlist.limite_de_alvos_atingido' })
  })
})

describe('moveTarget', () => {
  it('move o alvo e renumera sem lacuna', () => {
    // Act
    const outcome = moveTarget(SHORTLIST_IDS.laterais, 1006, V1, 1)

    // Assert
    expect(outcome.ok).toBe(true)
    expect(order(SHORTLIST_IDS.laterais)).toEqual([1006, 1007, 1001, 1009])
    expect(findShortlist(SHORTLIST_IDS.laterais)?.alvos.map((alvo) => alvo.prioridade)).toEqual([1, 2, 3, 4])
  })

  it('nao aceita a posicao n mais um', () => {
    // Act
    const outcome = moveTarget(SHORTLIST_IDS.laterais, 1006, V1, 5)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 422, code: 'shortlist.prioridade_fora_da_ordem' })
  })

  it('recusa um alvo que nao esta na shortlist', () => {
    // Act
    const outcome = moveTarget(SHORTLIST_IDS.laterais, 4242, V1, 1)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 404, code: 'shortlist.alvo_nao_encontrado' })
  })
})

describe('removeTarget', () => {
  it('remove o alvo, renumera e recalcula o custo total', () => {
    // Act
    const outcome = removeTarget(SHORTLIST_IDS.laterais, 1007, V1)

    // Assert
    expect(outcome.ok).toBe(true)
    expect(order(SHORTLIST_IDS.laterais)).toEqual([1001, 1006, 1009])
    expect(findShortlist(SHORTLIST_IDS.laterais)?.custoTotal).toEqual(millions(39))
  })

  it('omite o custo total quando a lista esvazia', () => {
    // Arrange
    removeTarget(SHORTLIST_IDS.conflito, 1005, V1)

    // Act
    const outcome = removeTarget(SHORTLIST_IDS.conflito, 1008, '"2"')

    // Assert
    expect(outcome.ok && 'custoTotal' in outcome.shortlist).toBe(false)
  })
})

describe('concorrencia', () => {
  it('exige o If-Match', () => {
    // Act
    const outcome = removeTarget(SHORTLIST_IDS.laterais, 1007, null)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 428 })
  })

  it('recusa a versao velha', () => {
    // Arrange
    removeTarget(SHORTLIST_IDS.laterais, 1007, V1)

    // Act
    const outcome = moveTarget(SHORTLIST_IDS.laterais, 1006, V1, 1)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 412, code: 'shortlist.alterada_por_outra_requisicao' })
  })

  it('responde 404 para a shortlist desconhecida', () => {
    // Act
    const outcome = removeTarget(SHORTLIST_IDS.missing, 1007, V1)

    // Assert
    expect(outcome).toEqual({ ok: false, status: 404, code: 'shortlist.nao_encontrada' })
  })
})

describe('resetShortlistStore', () => {
  it('volta ao estado inicial', () => {
    // Arrange
    removeTarget(SHORTLIST_IDS.laterais, 1007, V1)

    // Act
    resetShortlistStore()

    // Assert
    expect(order(SHORTLIST_IDS.laterais)).toEqual([1007, 1001, 1006, 1009])
  })
})
