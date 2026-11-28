import { describe, expect, it } from 'vitest'
import { anaShortlists, buildShortlist, lateraisShortlist, meiasShortlist } from '../../../mocks/fixtures/shortlists'
import { sortByName } from '../../../utils/shortlists'
import { HOME_LIMIT, homeShortlists } from './homeShortlists'

const sixShortlists = () =>
  sortByName([
    ...anaShortlists(),
    buildShortlist({ shortlistId: 'goleiros', nome: 'Goleiros' }),
    buildShortlist({ shortlistId: 'zagueiros', nome: 'Zagueiros sub-23' }),
  ])

describe('homeShortlists', () => {
  it('mostra no maximo cinco e avisa que ha mais', () => {
    // Act
    const view = homeShortlists(sixShortlists())

    // Assert
    expect(HOME_LIMIT).toBe(5)
    expect(view.rows.map((row) => row.title)).toEqual([
      'Atacantes',
      'Conflito',
      'Goleiros',
      'Laterais 2027',
      'Meias para janeiro',
    ])
    expect(view.hasMore).toBe(true)
  })

  it('mostra todas quando sao ate cinco', () => {
    // Act
    const view = homeShortlists(sortByName(anaShortlists()))

    // Assert
    expect(view.rows).toHaveLength(4)
    expect(view.hasMore).toBe(false)
  })

  it('descreve os alvos e o custo total', () => {
    // Act
    const [row] = homeShortlists([lateraisShortlist()]).rows

    // Assert
    expect(row).toEqual({
      id: lateraisShortlist().shortlistId,
      shortlistId: lateraisShortlist().shortlistId,
      title: 'Laterais 2027',
      detail: '4 de 25 alvos · €47M',
    })
  })

  it('descreve a shortlist sem alvos', () => {
    // Act
    const [row] = homeShortlists([meiasShortlist()]).rows

    // Assert
    expect(row.detail).toBe('0 de 25 alvos · Sem alvos')
  })
})
