import { describe, expect, it } from 'vitest'
import type { components } from '../../../api/schema'
import { formatMonthYear, transferFee, transferRows } from './transfers'

type Transfer = components['schemas']['SofaTransfer']

const JAN_2024 = Date.UTC(2024, 0, 15) / 1000
const JUL_2022 = Date.UTC(2022, 6, 1) / 1000
const JAN_2020 = Date.UTC(2020, 0, 2) / 1000

const transfer = (data: Partial<Transfer> = {}): Transfer => ({
  id: 1,
  fromTeamName: 'Serra Azul',
  toTeamName: 'Atlético Serrano',
  transferFrom: { id: 10, name: 'Serra Azul', shortName: 'Serra' },
  transferTo: { id: 1960, name: 'Atlético Serrano', shortName: 'Serrano' },
  transferFeeDescription: null,
  transferDateTimestamp: JAN_2024,
  transferFeeRaw: null,
  ...data,
})

describe('transferRows', () => {
  it('ordena da mais recente para a mais antiga', () => {
    // Arrange
    const history = [
      transfer({ id: 1, transferDateTimestamp: JAN_2020 }),
      transfer({ id: 2, transferDateTimestamp: JAN_2024 }),
      transfer({ id: 3, transferDateTimestamp: JUL_2022 }),
    ]

    // Act
    const rows = transferRows(history)

    // Assert
    expect(rows.map((row) => row.id)).toEqual(['2', '3', '1'])
  })

  it('mostra origem, destino, data e valor', () => {
    // Arrange
    const history = [transfer({ transferFeeRaw: { value: 3_200_000, currency: 'EUR' } })]

    // Act
    const [row] = transferRows(history)

    // Assert
    expect(row.title).toBe('Serra Azul → Atlético Serrano')
    expect(row.detail).toBe('jan. 2024 · €3,2M')
  })

  it('usa o nome do time quando falta o nome da transferencia', () => {
    // Arrange
    const history = [transfer({ fromTeamName: '', toTeamName: '' })]

    // Act
    const [row] = transferRows(history)

    // Assert
    expect(row.title).toBe('Serra Azul → Atlético Serrano')
  })

  it('mostra so a data quando nao ha valor nem descricao conhecida', () => {
    // Arrange
    const history = [transfer({ transferDateTimestamp: JAN_2020, transferFeeDescription: '-' })]

    // Act
    const [row] = transferRows(history)

    // Assert
    expect(row.detail).toBe('jan. 2020')
  })

  it('devolve lista vazia sem historico', () => {
    // Arrange
    const history = null

    // Act
    const rows = transferRows(history)

    // Assert
    expect(rows).toEqual([])
  })
})

describe('transferFee', () => {
  it.each([
    ['Free', 'Livre'],
    ['Free transfer', 'Livre'],
    ['Loan', 'Empréstimo'],
    ['End of loan', 'Fim de empréstimo'],
    ['-', undefined],
    [null, undefined],
  ])('traduz a descricao %s para %s', (description, expected) => {
    // Act
    const fee = transferFee(transfer({ transferFeeDescription: description }))

    // Assert
    expect(fee).toBe(expected)
  })

  it('prefere o valor acima de zero a descricao', () => {
    // Act
    const fee = transferFee(transfer({ transferFeeDescription: 'Loan', transferFeeRaw: { value: 500_000, currency: 'EUR' } }))

    // Assert
    expect(fee).toBe('€500 mil')
  })

  it('ignora o valor zero', () => {
    // Act
    const fee = transferFee(transfer({ transferFeeDescription: 'Free', transferFeeRaw: { value: 0, currency: 'EUR' } }))

    // Assert
    expect(fee).toBe('Livre')
  })
})

describe('formatMonthYear', () => {
  it.each([
    [JAN_2024, 'jan. 2024'],
    [JUL_2022, 'jul. 2022'],
    [Date.UTC(2023, 4, 31) / 1000, 'mai. 2023'],
  ])('formata %d como %s', (timestamp, expected) => {
    // Act
    const text = formatMonthYear(timestamp)

    // Assert
    expect(text).toBe(expected)
  })
})
