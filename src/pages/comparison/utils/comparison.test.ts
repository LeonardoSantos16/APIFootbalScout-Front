import { describe, expect, it } from 'vitest'
import type { AttributeType } from '../../../interfaces/attribute'
import { IncompleteResponseError } from '../../../utils/attributes'
import type { ComparedValue, ComparisonResponse } from '../interfaces/comparison'
import { buildComparison } from './comparison'

const PLAYERS = { pageId: 1001, otherId: 1006 }

const calculated = (value: number, sample = 1284): ComparedValue => ({
  resultado: 'Calculada',
  valor: value,
  amostraEmMinutos: sample,
})

const notPublished = (): ComparedValue => ({ resultado: 'Recusada', motivo: 'FonteNaoAtribuiu' })

const PAGE_VALUES: Record<AttributeType, ComparedValue> = {
  Gols: calculated(0.19),
  Assistencias: calculated(0.14),
  PassesDecisivos: calculated(1.22),
  Desarmes: calculated(2.1),
  Interceptacoes: calculated(0.94),
  Rating: calculated(7.12),
  PrecisaoDePasse: calculated(87),
}

const OTHER_VALUES: Record<AttributeType, ComparedValue> = {
  Gols: calculated(0.46, 2340),
  Assistencias: calculated(0.12, 2340),
  PassesDecisivos: calculated(0.85, 2340),
  Desarmes: calculated(0.73, 2340),
  Interceptacoes: calculated(0.94, 2340),
  Rating: calculated(7.05, 2340),
  PrecisaoDePasse: calculated(74, 2340),
}

const response = (
  page: Partial<Record<AttributeType, ComparedValue>> = PAGE_VALUES,
  other: Partial<Record<AttributeType, ComparedValue>> = OTHER_VALUES,
): ComparisonResponse => ({
  resultado: 'Realizada',
  jogadores: {
    '1006': { nome: 'Diego Albuquerque', posicao: 'Ataque' },
    '1001': { nome: 'Rafael Montes', posicao: 'MeioCampo' },
  },
  recorte: { competicaoId: 325, temporadaId: 72034, contexto: 'Clube' },
  atributos: (Object.keys(PAGE_VALUES) as AttributeType[]).reverse().map((tipo) => ({
    tipo,
    valores: {
      ...(other[tipo] ? { '1006': other[tipo] } : {}),
      ...(page[tipo] ? { '1001': page[tipo] } : {}),
    },
  })),
})

describe('colunas', () => {
  it('poe o jogador da pagina a esquerda, qualquer que seja a ordem da resposta', () => {
    // Act
    const table = buildComparison(response(), PLAYERS)

    // Assert
    expect(table.columns.map((column) => column.name)).toEqual(['Rafael Montes', 'Diego Albuquerque'])
  })

  it('mostra a posicao e a amostra de cada jogador', () => {
    // Act
    const table = buildComparison(response(), PLAYERS)

    // Assert
    expect(table.columns.map((column) => column.detail)).toEqual(['Meio-campo · 1.284 min', 'Ataque · 2.340 min'])
  })

  it('usa a amostra mais comum do jogador', () => {
    // Arrange
    const other = { ...OTHER_VALUES, PrecisaoDePasse: calculated(74, 2100) }

    // Act
    const table = buildComparison(response(PAGE_VALUES, other), PLAYERS)

    // Assert
    expect(table.columns[1].detail).toBe('Ataque · 2.340 min')
  })

  it('deixa de fora a parte que falta', () => {
    // Arrange
    const data = response()
    data.jogadores['1006'] = { nome: 'Diego Albuquerque' }

    // Act
    const table = buildComparison(data, PLAYERS)

    // Assert
    expect(table.columns[1].detail).toBe('2.340 min')
  })
})

describe('linhas', () => {
  it('monta as sete linhas na ordem e com os rotulos das metricas', () => {
    // Act
    const table = buildComparison(response(), PLAYERS)

    // Assert
    expect(table.rows.map((row) => row.label)).toEqual([
      'Gols, por 90',
      'Assistências, por 90',
      'Passes decisivos, por 90',
      'Desarmes, por 90',
      'Interceptações, por 90',
      'Nota, média',
      'Precisão de passe',
    ])
  })

  it('formata os valores com a unidade', () => {
    // Act
    const table = buildComparison(response(), PLAYERS)

    // Assert
    const precision = table.rows[6]
    expect(precision.cells.map((cell) => cell.text)).toEqual(['87%', '74%'])
    expect(table.rows[3].cells.map((cell) => cell.text)).toEqual(['2,10', '0,73'])
  })

  it('destaca o maior valor e atenua o menor', () => {
    // Act
    const table = buildComparison(response(), PLAYERS)

    // Assert
    expect(table.rows[0].cells.map((cell) => cell.tone)).toEqual(['muted', 'strong'])
    expect(table.rows[3].cells.map((cell) => cell.tone)).toEqual(['strong', 'muted'])
  })

  it('nao destaca o empate', () => {
    // Act
    const table = buildComparison(response(), PLAYERS)

    // Assert
    expect(table.rows[4].cells.map((cell) => cell.tone)).toEqual(['neutral', 'neutral'])
  })

  it('trata como empate valores que aparecem iguais na tela', () => {
    // Arrange
    const other = { ...OTHER_VALUES, Gols: calculated(0.191, 2340) }

    // Act
    const table = buildComparison(response(PAGE_VALUES, other), PLAYERS)

    // Assert
    expect(table.rows[0].cells.map((cell) => cell.tone)).toEqual(['neutral', 'neutral'])
  })

  it('mostra o motivo na celula recusada e deixa o outro valor neutro', () => {
    // Arrange
    const other = { ...OTHER_VALUES, PrecisaoDePasse: notPublished() }

    // Act
    const table = buildComparison(response(PAGE_VALUES, other), PLAYERS)

    // Assert
    expect(table.rows[6].cells).toEqual([
      { text: '87%', tone: 'neutral' },
      { text: 'Não publicado pela fonte', tone: 'refused' },
    ])
  })
})

describe('resposta incompleta', () => {
  it('falha quando falta um atributo', () => {
    // Arrange
    const data = response()
    data.atributos = data.atributos?.filter((item) => item.tipo !== 'Gols')

    // Act
    const build = () => buildComparison(data, PLAYERS)

    // Assert
    expect(build).toThrow(IncompleteResponseError)
  })

  it('falha quando falta o valor de um dos jogadores', () => {
    // Arrange
    const { Gols: _ignored, ...other } = OTHER_VALUES

    // Act
    const build = () => buildComparison(response(PAGE_VALUES, other), PLAYERS)

    // Assert
    expect(build).toThrow(IncompleteResponseError)
  })

  it('falha quando um valor calculado chega sem numero', () => {
    // Arrange
    const other = { ...OTHER_VALUES, Gols: { resultado: 'Calculada', amostraEmMinutos: 2340 } as ComparedValue }

    // Act
    const build = () => buildComparison(response(PAGE_VALUES, other), PLAYERS)

    // Assert
    expect(build).toThrow(IncompleteResponseError)
  })
})
