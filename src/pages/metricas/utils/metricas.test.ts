import { describe, expect, it } from 'vitest'
import type { Atributo, MetricasPor90, TipoDeAtributo } from '../interfaces/metricas'
import {
  RespostaIncompletaError,
  ROTULO_DO_TIPO,
  TIPOS_EM_ORDEM,
  amostraDoRodape,
  montarLinhas,
  textoDaRecusa,
  textoDoRodape,
} from './metricas'

const calculada = (tipo: TipoDeAtributo, valor: number, amostraEmMinutos = 1284): Atributo => ({
  tipo,
  resultado: 'Calculada',
  valor,
  amostraEmMinutos,
})

const recusada = (
  tipo: TipoDeAtributo,
  motivo: Atributo['motivo'],
  amostraEmMinutos?: number,
): Atributo => ({ tipo, resultado: 'Recusada', motivo, amostraEmMinutos })

const resposta = (atributos: Atributo[]): MetricasPor90 => ({
  jogadorId: 1001,
  recorte: { competicaoId: 325, temporadaId: 72034, contexto: 'Clube' },
  atributos,
})

const todasCalculadas = (): Atributo[] => [
  calculada('PrecisaoDePasse', 86.43),
  calculada('Rating', 7.123),
  calculada('Interceptacoes', 1.4),
  calculada('Desarmes', 2.1),
  calculada('PassesDecisivos', 1.87),
  calculada('Assistencias', 0.21),
  calculada('Gols', 0.35),
]

describe('montarLinhas', () => {
  it('monta as sete linhas na ordem fixa', () => {
    // Act
    const linhas = montarLinhas(resposta(todasCalculadas()))

    // Assert
    expect(linhas.map((l) => l.tipo)).toEqual([
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
    const linhas = montarLinhas(resposta(todasCalculadas()))

    // Assert
    expect(linhas.map((l) => l.rotulo)).toEqual([
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
    const linhas = montarLinhas(resposta(todasCalculadas()))

    // Assert
    expect(Object.fromEntries(linhas.map((l) => [l.tipo, l.texto]))).toEqual({
      Gols: '0,35',
      Assistencias: '0,21',
      PassesDecisivos: '1,87',
      Desarmes: '2,10',
      Interceptacoes: '1,40',
      Rating: '7,12',
      PrecisaoDePasse: '86,4%',
    })
    expect(linhas.every((l) => !l.recusada)).toBe(true)
  })

  it('mantem as sete linhas quando todas sao recusadas', () => {
    // Arrange
    const atributos = TIPOS_EM_ORDEM.map((tipo) => recusada(tipo, 'AmostraInsuficiente', 312))

    // Act
    const linhas = montarLinhas(resposta(atributos))

    // Assert
    expect(linhas).toHaveLength(7)
    expect(linhas.every((l) => l.recusada)).toBe(true)
    expect(linhas[0].texto).toBe('Amostra insuficiente: 312 de 450 min')
  })

  it('falha quando falta um atributo', () => {
    // Arrange
    const atributos = todasCalculadas().filter((a) => a.tipo !== 'Desarmes')

    // Act
    const montar = () => montarLinhas(resposta(atributos))

    // Assert
    expect(montar).toThrow(RespostaIncompletaError)
  })

  it('falha quando um atributo calculado chega sem valor', () => {
    // Arrange
    const atributos = todasCalculadas().map((a) =>
      a.tipo === 'Gols' ? { ...a, valor: undefined } : a,
    )

    // Act
    const montar = () => montarLinhas(resposta(atributos))

    // Assert
    expect(montar).toThrow(RespostaIncompletaError)
  })

  it('ignora um atributo de tipo desconhecido', () => {
    // Arrange
    const desconhecido = { ...calculada('Gols', 9), tipo: 'Cruzamentos' } as unknown as Atributo
    const atributos = [...todasCalculadas(), desconhecido]

    // Act
    const linhas = montarLinhas(resposta(atributos))

    // Assert
    expect(linhas).toHaveLength(7)
    expect(linhas[0].texto).toBe('0,35')
  })

  it('expoe a ordem e os rotulos para o carregamento', () => {
    // Act
    const rotulos = TIPOS_EM_ORDEM.map((tipo) => ROTULO_DO_TIPO[tipo])

    // Assert
    expect(rotulos).toHaveLength(7)
    expect(rotulos[5]).toBe('Nota, média')
  })
})

describe('amostra', () => {
  it('usa no rodape a amostra mais comum', () => {
    // Arrange
    const atributos = todasCalculadas().map((a) =>
      a.tipo === 'PrecisaoDePasse' ? { ...a, amostraEmMinutos: 1190 } : a,
    )

    // Act
    const amostra = amostraDoRodape(atributos)

    // Assert
    expect(amostra).toBe(1284)
  })

  it('conta a amostra dos atributos recusados', () => {
    // Arrange
    const atributos = [
      calculada('Gols', 0.35, 1284),
      recusada('Assistencias', 'AmostraInsuficiente', 312),
      recusada('Desarmes', 'AmostraInsuficiente', 312),
    ]

    // Act
    const amostra = amostraDoRodape(atributos)

    // Assert
    expect(amostra).toBe(312)
  })

  it('desempata pela maior amostra', () => {
    // Arrange
    const atributos = [calculada('Gols', 0.35, 900), calculada('Assistencias', 0.21, 1284)]

    // Act
    const amostra = amostraDoRodape(atributos)

    // Assert
    expect(amostra).toBe(1284)
  })

  it('nao tem amostra quando nenhum atributo traz amostra', () => {
    // Arrange
    const atributos = [recusada('Interceptacoes', 'FonteNaoAtribuiu')]

    // Act
    const amostra = amostraDoRodape(atributos)

    // Assert
    expect(amostra).toBeUndefined()
  })

  it('so mostra a amostra na linha quando ela difere do rodape', () => {
    // Arrange
    const atributos = todasCalculadas().map((a) =>
      a.tipo === 'PrecisaoDePasse' ? { ...a, amostraEmMinutos: 1190 } : a,
    )

    // Act
    const linhas = montarLinhas(resposta(atributos))

    // Assert
    const comAmostra = linhas.filter((l) => l.amostra)
    expect(comAmostra.map((l) => [l.tipo, l.amostra])).toEqual([['PrecisaoDePasse', '1.190 min jogados']])
  })

  it('nao mostra amostra na linha recusada', () => {
    // Arrange
    const atributos = todasCalculadas().map((a) =>
      a.tipo === 'Gols' ? recusada('Gols', 'AmostraInsuficiente', 312) : a,
    )

    // Act
    const linhas = montarLinhas(resposta(atributos))

    // Assert
    expect(linhas[0].amostra).toBeUndefined()
  })

  it('escreve o rodape com a amostra e a regra do minimo', () => {
    // Act
    const texto = textoDoRodape(1284)

    // Assert
    expect(texto).toBe(
      'Amostra: 1.284 min jogados. Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor.',
    )
  })

  it('escreve o rodape so com a regra do minimo sem amostra', () => {
    // Act
    const texto = textoDoRodape()

    // Assert
    expect(texto).toBe('Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor.')
  })
})

describe('textoDaRecusa', () => {
  it('mostra a amostra contra o minimo', () => {
    // Act
    const texto = textoDaRecusa(recusada('Gols', 'AmostraInsuficiente', 312))

    // Assert
    expect(texto).toBe('Amostra insuficiente: 312 de 450 min')
  })

  it('mostra so o minimo quando a amostra nao vem', () => {
    // Act
    const texto = textoDaRecusa(recusada('Gols', 'AmostraInsuficiente'))

    // Assert
    expect(texto).toBe('Amostra insuficiente: mínimo de 450 min')
  })

  it('usa o separador de milhar na amostra', () => {
    // Act
    const texto = textoDaRecusa(recusada('Gols', 'AmostraInsuficiente', 1050))

    // Assert
    expect(texto).toBe('Amostra insuficiente: 1.050 de 450 min')
  })

  it('diz que a fonte nao publicou', () => {
    // Act
    const texto = textoDaRecusa(recusada('Interceptacoes', 'FonteNaoAtribuiu'))

    // Assert
    expect(texto).toBe('Não publicado pela fonte')
  })
})
