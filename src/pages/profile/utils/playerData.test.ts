import { describe, expect, it } from 'vitest'
import type { PlayerProfile } from '../../../interfaces/player'
import { buildFullProfile } from '../../../mocks/fixtures/profiles'
import { formatBirth, playerData } from './playerData'

const TODAY = new Date('2026-11-17T12:00:00Z')

const withDetails = (data: Partial<NonNullable<PlayerProfile['details']>>, profile = buildFullProfile()): PlayerProfile => ({
  ...profile,
  details: { ...profile.details!, ...data },
})

describe('playerData', () => {
  it('lista os dados na ordem fixa, com o valor e o rotulo', () => {
    // Arrange
    const profile = buildFullProfile()

    // Act
    const data = playerData(profile, TODAY)

    // Assert
    expect(data).toEqual([
      { label: 'Posição · MC, ME', value: 'Meio-campo' },
      { label: 'Nascimento', value: '14/03/1999 (27 anos)' },
      { label: 'Altura', value: '178 cm' },
      { label: 'Pé preferido', value: 'Direito' },
      { label: 'Camisa', value: '8' },
      { label: 'Seleção', value: 'Brasil, 12 jogos, 2 gols' },
    ])
  })

  it('usa so Posicao sem posicoes detalhadas', () => {
    // Arrange
    const profile = withDetails({ positionsDetailed: [] })

    // Act
    const data = playerData(profile, TODAY)

    // Assert
    expect(data[0]).toEqual({ label: 'Posição', value: 'Meio-campo' })
  })

  it('poe as posicoes detalhadas no rotulo', () => {
    // Arrange
    const profile = withDetails({ positionsDetailed: ['MC', 'ME'] })

    // Act
    const data = playerData(profile, TODAY)

    // Assert
    expect(data[0]).toEqual({ label: 'Posição · MC, ME', value: 'Meio-campo' })
  })

  it.each([
    ['Right', 'Direito'],
    ['Left', 'Esquerdo'],
    ['Both', 'Ambos'],
  ])('traduz o pe %s para %s', (foot, expected) => {
    // Arrange
    const profile = withDetails({ preferredFoot: foot })

    // Act
    const data = playerData(profile, TODAY)

    // Assert
    expect(data).toContainEqual({ label: 'Pé preferido', value: expected })
  })

  it('deixa de fora pe desconhecido, altura zero e camisa ausente', () => {
    // Arrange
    const profile = withDetails({ preferredFoot: 'Unknown', height: 0, jerseyNumber: null })

    // Act
    const labels = playerData(profile, TODAY).map((item) => item.label)

    // Assert
    expect(labels).toEqual(['Posição · MC, ME', 'Nascimento', 'Seleção'])
  })

  it('deixa de fora a posicao de letra desconhecida e o nascimento ausente', () => {
    // Arrange
    const profile = withDetails({ position: 'X', dateOfBirth: '' })

    // Act
    const labels = playerData(profile, TODAY).map((item) => item.label)

    // Assert
    expect(labels.some((label) => label.startsWith('Posição'))).toBe(false)
    expect(labels).not.toContain('Nascimento')
  })

  it('usa o singular para um jogo e um gol', () => {
    // Arrange
    const base = buildFullProfile()
    const profile: PlayerProfile = {
      ...base,
      nationalTeamStats: [{ ...base.nationalTeamStats![0], appearances: 1, goals: 1 }],
    }

    // Act
    const data = playerData(profile, TODAY)

    // Assert
    expect(data).toContainEqual({ label: 'Seleção', value: 'Brasil, 1 jogo, 1 gol' })
  })

  it('cria uma entrada por selecao', () => {
    // Arrange
    const base = buildFullProfile()
    const senior = base.nationalTeamStats![0]
    const profile: PlayerProfile = {
      ...base,
      nationalTeamStats: [senior, { ...senior, team: { ...senior.team, id: 4749, name: 'Brasil Sub-20' }, appearances: 8, goals: 0 }],
    }

    // Act
    const data = playerData(profile, TODAY).filter((item) => item.label === 'Seleção')

    // Assert
    expect(data.map((item) => item.value)).toEqual(['Brasil, 12 jogos, 2 gols', 'Brasil Sub-20, 8 jogos, 0 gols'])
  })

  it('devolve lista vazia sem detalhes', () => {
    // Arrange
    const profile: PlayerProfile = { details: null, nationalTeamStats: [] }

    // Act
    const data = playerData(profile, TODAY)

    // Assert
    expect(data).toEqual([])
  })
})

describe('formatBirth', () => {
  it('mostra a data e a idade completa', () => {
    // Arrange
    const birth = '2001-03-14T00:00:00Z'

    // Act
    const text = formatBirth(birth, new Date('2026-03-13T12:00:00Z'))

    // Assert
    expect(text).toBe('14/03/2001 (24 anos)')
  })
})
