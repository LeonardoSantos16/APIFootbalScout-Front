import { describe, expect, it } from 'vitest'
import type { Attribute, AttributeType, MetricsPer90 } from '../interfaces/metrics'
import {
  ATTRIBUTE_LABEL,
  ATTRIBUTE_ORDER,
  IncompleteResponseError,
  buildRows,
  footerSample,
  footerText,
  refusalText,
} from './metrics'

const calculated = (type: AttributeType, value: number, sample = 1284): Attribute => ({
  tipo: type,
  resultado: 'Calculada',
  valor: value,
  amostraEmMinutos: sample,
})

const refused = (type: AttributeType, reason: Attribute['motivo'], sample?: number): Attribute => ({
  tipo: type,
  resultado: 'Recusada',
  motivo: reason,
  amostraEmMinutos: sample,
})

const response = (attributes: Attribute[]): MetricsPer90 => ({
  jogadorId: 1001,
  recorte: { competicaoId: 325, temporadaId: 72034, contexto: 'Clube' },
  atributos: attributes,
})

const allCalculated = (): Attribute[] => [
  calculated('PrecisaoDePasse', 86.43),
  calculated('Rating', 7.123),
  calculated('Interceptacoes', 1.4),
  calculated('Desarmes', 2.1),
  calculated('PassesDecisivos', 1.87),
  calculated('Assistencias', 0.21),
  calculated('Gols', 0.35),
]

const withSample = (attributes: Attribute[], type: AttributeType, sample: number) =>
  attributes.map((a) => (a.tipo === type ? { ...a, amostraEmMinutos: sample } : a))

describe('buildRows', () => {
  it('monta as sete linhas na ordem fixa', () => {
    // Act
    const rows = buildRows(response(allCalculated()))

    // Assert
    expect(rows.map((r) => r.type)).toEqual([
      'Gols',
      'Assistencias',
      'PassesDecisivos',
      'Desarmes',
      'Interceptacoes',
      'Rating',
      'PrecisaoDePasse',
    ])
  })

  it('poe a unidade no rotulo', () => {
    // Act
    const rows = buildRows(response(allCalculated()))

    // Assert
    expect(rows.map((r) => r.label)).toEqual([
      'Gols, por 90',
      'Assistências, por 90',
      'Passes decisivos, por 90',
      'Desarmes, por 90',
      'Interceptações, por 90',
      'Nota, média',
      'Precisão de passe',
    ])
  })

  it('formata o valor de cada linha calculada', () => {
    // Act
    const rows = buildRows(response(allCalculated()))

    // Assert
    expect(Object.fromEntries(rows.map((r) => [r.type, r.text]))).toEqual({
      Gols: '0,35',
      Assistencias: '0,21',
      PassesDecisivos: '1,87',
      Desarmes: '2,10',
      Interceptacoes: '1,40',
      Rating: '7,12',
      PrecisaoDePasse: '86,4%',
    })
    expect(rows.every((r) => !r.refused)).toBe(true)
  })

  it('mantem as sete linhas quando todas sao recusadas', () => {
    // Arrange
    const attributes = ATTRIBUTE_ORDER.map((type) => refused(type, 'AmostraInsuficiente', 312))

    // Act
    const rows = buildRows(response(attributes))

    // Assert
    expect(rows).toHaveLength(7)
    expect(rows.every((r) => r.refused)).toBe(true)
    expect(rows[0].text).toBe('Amostra insuficiente: 312 de 450 min')
  })

  it('falha quando falta um atributo', () => {
    // Arrange
    const attributes = allCalculated().filter((a) => a.tipo !== 'Desarmes')

    // Act
    const build = () => buildRows(response(attributes))

    // Assert
    expect(build).toThrow(IncompleteResponseError)
  })

  it('falha quando um atributo calculado chega sem valor', () => {
    // Arrange
    const attributes = allCalculated().map((a) => (a.tipo === 'Gols' ? { ...a, valor: undefined } : a))

    // Act
    const build = () => buildRows(response(attributes))

    // Assert
    expect(build).toThrow(IncompleteResponseError)
  })

  it('ignora um atributo de tipo desconhecido', () => {
    // Arrange
    const unknown = { ...calculated('Gols', 9), tipo: 'Cruzamentos' } as unknown as Attribute
    const attributes = [...allCalculated(), unknown]

    // Act
    const rows = buildRows(response(attributes))

    // Assert
    expect(rows).toHaveLength(7)
    expect(rows[0].text).toBe('0,35')
  })

  it('expoe a ordem e os rotulos para o carregamento', () => {
    // Act
    const labels = ATTRIBUTE_ORDER.map((type) => ATTRIBUTE_LABEL[type])

    // Assert
    expect(labels).toHaveLength(7)
    expect(labels[5]).toBe('Nota, média')
  })
})

describe('amostra', () => {
  it('usa no rodape a amostra mais comum', () => {
    // Arrange
    const attributes = withSample(allCalculated(), 'PrecisaoDePasse', 1190)

    // Act
    const sample = footerSample(attributes)

    // Assert
    expect(sample).toBe(1284)
  })

  it('conta a amostra dos atributos recusados', () => {
    // Arrange
    const attributes = [
      calculated('Gols', 0.35, 1284),
      refused('Assistencias', 'AmostraInsuficiente', 312),
      refused('Desarmes', 'AmostraInsuficiente', 312),
    ]

    // Act
    const sample = footerSample(attributes)

    // Assert
    expect(sample).toBe(312)
  })

  it('desempata pela maior amostra', () => {
    // Arrange
    const attributes = [calculated('Gols', 0.35, 900), calculated('Assistencias', 0.21, 1284)]

    // Act
    const sample = footerSample(attributes)

    // Assert
    expect(sample).toBe(1284)
  })

  it('nao tem amostra quando nenhum atributo traz amostra', () => {
    // Arrange
    const attributes = [refused('Interceptacoes', 'FonteNaoAtribuiu')]

    // Act
    const sample = footerSample(attributes)

    // Assert
    expect(sample).toBeUndefined()
  })

  it('so mostra a amostra na linha quando ela difere do rodape', () => {
    // Arrange
    const attributes = withSample(allCalculated(), 'PrecisaoDePasse', 1190)

    // Act
    const rows = buildRows(response(attributes))

    // Assert
    const withOwnSample = rows.filter((r) => r.sample)
    expect(withOwnSample.map((r) => [r.type, r.sample])).toEqual([['PrecisaoDePasse', '1.190 min jogados']])
  })

  it('nao mostra amostra na linha recusada', () => {
    // Arrange
    const attributes = allCalculated().map((a) =>
      a.tipo === 'Gols' ? refused('Gols', 'AmostraInsuficiente', 312) : a,
    )

    // Act
    const rows = buildRows(response(attributes))

    // Assert
    expect(rows[0].sample).toBeUndefined()
  })

  it('escreve o rodape com a amostra e a regra do minimo', () => {
    // Act
    const text = footerText(1284)

    // Assert
    expect(text).toBe(
      'Amostra: 1.284 min jogados. Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor.',
    )
  })

  it('escreve o rodape so com a regra do minimo sem amostra', () => {
    // Act
    const text = footerText()

    // Assert
    expect(text).toBe('Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor.')
  })
})

describe('refusalText', () => {
  it('mostra a amostra contra o minimo', () => {
    // Act
    const text = refusalText(refused('Gols', 'AmostraInsuficiente', 312))

    // Assert
    expect(text).toBe('Amostra insuficiente: 312 de 450 min')
  })

  it('mostra so o minimo quando a amostra nao vem', () => {
    // Act
    const text = refusalText(refused('Gols', 'AmostraInsuficiente'))

    // Assert
    expect(text).toBe('Amostra insuficiente: mínimo de 450 min')
  })

  it('usa o separador de milhar na amostra', () => {
    // Act
    const text = refusalText(refused('Gols', 'AmostraInsuficiente', 1050))

    // Assert
    expect(text).toBe('Amostra insuficiente: 1.050 de 450 min')
  })

  it('diz que a fonte nao publicou', () => {
    // Act
    const text = refusalText(refused('Interceptacoes', 'FonteNaoAtribuiu'))

    // Assert
    expect(text).toBe('Não publicado pela fonte')
  })
})
