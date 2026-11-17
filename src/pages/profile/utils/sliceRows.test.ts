import { describe, expect, it } from 'vitest'
import type { PlayerProfile } from '../../../interfaces/player'
import { buildFullProfile } from '../../../mocks/fixtures/profiles'
import { sliceRows } from './sliceRows'

const clubItem = (profile: PlayerProfile) => profile.stats!.find((item) => item.team.id !== 4748)!
const nationalItem = (profile: PlayerProfile) => profile.stats!.find((item) => item.team.id === 4748)!

describe('sliceRows', () => {
  it('cria uma linha por item de stats, na ordem da fonte', () => {
    // Arrange
    const base = buildFullProfile()
    const profile: PlayerProfile = { ...base, stats: [nationalItem(base), clubItem(base)] }

    // Act
    const rows = sliceRows(profile)

    // Assert
    expect(rows.map((row) => row.title)).toEqual([
      `Seleção · ${nationalItem(base).uniqueTournament.name} · ${nationalItem(base).year}`,
      `Clube · ${clubItem(base).uniqueTournament.name} · ${clubItem(base).year}`,
    ])
  })

  it('omite o contexto quando o jogador so tem recortes de clube', () => {
    // Arrange
    const base = buildFullProfile()
    const profile: PlayerProfile = { ...base, stats: [clubItem(base)] }

    // Act
    const [row] = sliceRows(profile)

    // Assert
    expect(row.title).toBe(`${clubItem(base).uniqueTournament.name} · ${clubItem(base).year}`)
  })

  it('mostra jogos, minutos, gols, assistencias e nota, com zero', () => {
    // Arrange
    const base = buildFullProfile()
    const item = clubItem(base)
    const profile: PlayerProfile = {
      ...base,
      stats: [
        {
          ...item,
          statistics: { ...item.statistics, appearances: 24, minutesPlayed: 1920, goals: 0, assists: 3, rating: 7.123 },
        },
      ],
    }

    // Act
    const [row] = sliceRows(profile)

    // Assert
    expect(row.cells).toEqual([
      { value: '24', label: 'jogos' },
      { value: '1.920', label: 'min' },
      { value: '0', label: 'gols' },
      { value: '3', label: 'assist.' },
      { value: '7,12', label: 'nota', labelBefore: true },
    ])
  })

  it('leva o recorte para o link das metricas', () => {
    // Arrange
    const base = buildFullProfile()
    const item = clubItem(base)
    const profile: PlayerProfile = { ...base, stats: [item] }

    // Act
    const [row] = sliceRows(profile)

    // Assert
    expect(row.slice).toMatchObject({
      competitionId: item.uniqueTournament.id,
      seasonId: item.season.id,
      context: 'Clube',
    })
  })

  it('devolve lista vazia sem stats', () => {
    // Arrange
    const profile: PlayerProfile = { ...buildFullProfile(), stats: null }

    // Act
    const rows = sliceRows(profile)

    // Assert
    expect(rows).toEqual([])
  })
})
