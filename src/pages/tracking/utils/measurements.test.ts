import { describe, expect, it } from 'vitest'
import type { TrackingResponse } from '../interfaces/tracking'
import { buildMeasurements } from './measurements'

const euros = (value: number) => ({ quantiaEmCentavos: value * 100, moeda: 'EUR' })

const response = (overrides: Partial<TrackingResponse> = {}): TrackingResponse => ({
  dossieId: '7c1f0d7e-2b1a-4a8e-9a63-1d2f3e4a5b6c',
  jogadorId: 1001,
  janela: { de: '2026-10-22T14:00:00Z', ate: '2026-11-18T14:00:00Z', duracaoEmDias: 27.4 },
  clube: { resultado: 'ComMudanca', anterior: 'Vila Nova Paulista', atual: 'Atlético Serrano' },
  valorDeMercado: {
    resultado: 'ComMudanca',
    anterior: euros(8_000_000),
    atual: euros(9_600_000),
    variacaoPercentualAbsoluta: 20,
  },
  minutagem: { resultado: 'ComMudanca', anterior: 820, atual: 1240, variacaoAbsoluta: 420 },
  ...overrides,
})

describe('buildMeasurements', () => {
  it('monta as tres afericoes na ordem clube, valor de mercado e minutagem', () => {
    // Act
    const measurements = buildMeasurements(response())

    // Assert
    expect(measurements.map((measurement) => measurement.title)).toEqual(['Clube', 'Valor de mercado', 'Minutagem'])
  })

  it('mostra a mudanca de clube sem variacao', () => {
    // Act
    const [club] = buildMeasurements(response())

    // Assert
    expect(club).toEqual({
      title: 'Clube',
      state: 'ComMudanca',
      previous: 'Vila Nova Paulista',
      current: 'Atlético Serrano',
    })
  })

  it('mostra a alta do valor de mercado com sinal e palavra', () => {
    // Act
    const [, marketValue] = buildMeasurements(response())

    // Assert
    expect(marketValue).toEqual({
      title: 'Valor de mercado',
      state: 'ComMudanca',
      previous: '€8M',
      current: '€9,6M',
      change: { direction: 'up', text: '+20,0% alta' },
    })
  })

  it('mostra a queda do valor de mercado pelo atual contra o anterior', () => {
    // Arrange
    const down = response({
      valorDeMercado: {
        resultado: 'ComMudanca',
        anterior: euros(12_500_000),
        atual: euros(10_000_000),
        variacaoPercentualAbsoluta: 20,
      },
    })

    // Act
    const [, marketValue] = buildMeasurements(down)

    // Assert
    expect(marketValue).toEqual({
      title: 'Valor de mercado',
      state: 'ComMudanca',
      previous: '€12,5M',
      current: '€10M',
      change: { direction: 'down', text: '−20,0% queda' },
    })
  })

  it('mostra os minutos a mais na minutagem', () => {
    // Act
    const [, , minutes] = buildMeasurements(response())

    // Assert
    expect(minutes).toEqual({
      title: 'Minutagem',
      state: 'ComMudanca',
      previous: '820',
      current: '1.240 min',
      change: { direction: 'up', text: '+420 min a mais' },
    })
  })

  it('mostra so o valor atual quando nao ha mudanca relevante', () => {
    // Arrange
    const unchanged = response({
      clube: { resultado: 'SemMudancaRelevante', anterior: 'Atlético Serrano', atual: 'Atlético Serrano' },
      valorDeMercado: {
        resultado: 'SemMudancaRelevante',
        anterior: euros(4_400_000),
        atual: euros(4_500_000),
        variacaoPercentualAbsoluta: 2.3,
      },
      minutagem: { resultado: 'SemMudancaRelevante', anterior: 1320, atual: 1410, variacaoAbsoluta: 90 },
    })

    // Act
    const measurements = buildMeasurements(unchanged)

    // Assert
    expect(measurements).toEqual([
      { title: 'Clube', state: 'SemMudancaRelevante', current: 'Atlético Serrano' },
      { title: 'Valor de mercado', state: 'SemMudancaRelevante', current: '€4,5M' },
      { title: 'Minutagem', state: 'SemMudancaRelevante', current: '1.410 min' },
    ])
  })

  it('deixa sem valor a afericao sem mudanca relevante que nao traz o atual', () => {
    // Arrange
    const withoutCurrent = response({ clube: { resultado: 'SemMudancaRelevante' } })

    // Act
    const [club] = buildMeasurements(withoutCurrent)

    // Assert
    expect(club).toEqual({ title: 'Clube', state: 'SemMudancaRelevante' })
  })

  it('explica a moeda inesperada sem mostrar valores', () => {
    // Arrange
    const unavailable = response({
      valorDeMercado: { resultado: 'Indisponivel', anterior: euros(8_000_000), motivo: 'MoedaInesperada' },
    })

    // Act
    const [, marketValue] = buildMeasurements(unavailable)

    // Assert
    expect(marketValue).toEqual({
      title: 'Valor de mercado',
      state: 'Indisponivel',
      reason: 'A fonte passou a publicar o valor em outra moeda; comparar seria enganoso.',
    })
  })

  it('explica a virada de temporada sem mostrar valores', () => {
    // Arrange
    const unavailable = response({
      minutagem: { resultado: 'Indisponivel', anterior: 2310, atual: 90, motivo: 'TemporadaVirada' },
    })

    // Act
    const [, , minutes] = buildMeasurements(unavailable)

    // Assert
    expect(minutes).toEqual({
      title: 'Minutagem',
      state: 'Indisponivel',
      reason: 'A temporada virou e a minutagem zerou. A leitura antiga não é comparável.',
    })
  })
})
