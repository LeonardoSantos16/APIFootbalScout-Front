import { describe, expect, it } from 'vitest'
import type { DetalhesDoJogador } from '../interfaces/jogador'
import { idade, linhaDeApoio, posicaoPelaLetra } from './jogador'

const HOJE = new Date('2026-11-17T12:00:00Z')

const detalhes = (dados: Partial<DetalhesDoJogador> = {}): DetalhesDoJogador =>
  ({
    id: 1001,
    name: 'Rafael Montes',
    position: 'M',
    dateOfBirth: '1999-03-14T00:00:00Z',
    team: { id: 1960, name: 'Atlético Serrano' },
    ...dados,
  }) as DetalhesDoJogador

describe('posicaoPelaLetra', () => {
  it.each([
    ['G', 'Goleiro'],
    ['D', 'Defesa'],
    ['M', 'Meio-campo'],
    ['F', 'Ataque'],
  ])('traduz %s para %s', (letra, esperado) => {
    // Act
    const posicao = posicaoPelaLetra(letra)

    // Assert
    expect(posicao).toBe(esperado)
  })

  it.each([['X'], [''], [null], [undefined]])('nao traduz a letra %s', (letra) => {
    // Act
    const posicao = posicaoPelaLetra(letra)

    // Assert
    expect(posicao).toBeUndefined()
  })
})

describe('idade', () => {
  it('conta os anos completos', () => {
    // Act
    const anos = idade('1999-03-14T00:00:00Z', HOJE)

    // Assert
    expect(anos).toBe(27)
  })

  it('nao conta o ano antes do aniversario', () => {
    // Act
    const anos = idade('1999-12-01T00:00:00Z', HOJE)

    // Assert
    expect(anos).toBe(26)
  })

  it('conta o ano no dia do aniversario', () => {
    // Act
    const anos = idade('2000-11-17T00:00:00Z', HOJE)

    // Assert
    expect(anos).toBe(26)
  })
})

describe('linhaDeApoio', () => {
  it('junta posicao, idade e clube', () => {
    // Act
    const linha = linhaDeApoio(detalhes(), HOJE)

    // Assert
    expect(linha).toBe('Meio-campo, 27 anos, Atlético Serrano')
  })

  it('deixa de fora a posicao desconhecida', () => {
    // Act
    const linha = linhaDeApoio(detalhes({ position: 'X' }), HOJE)

    // Assert
    expect(linha).toBe('27 anos, Atlético Serrano')
  })

  it('deixa de fora o que a fonte nao mandou', () => {
    // Arrange
    const semClubeNemNascimento = detalhes({
      team: undefined as unknown as DetalhesDoJogador['team'],
      dateOfBirth: undefined as unknown as string,
    })

    // Act
    const linha = linhaDeApoio(semClubeNemNascimento, HOJE)

    // Assert
    expect(linha).toBe('Meio-campo')
  })
})
