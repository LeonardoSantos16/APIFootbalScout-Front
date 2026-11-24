import type { components } from '../../api/schema'

type Schemas = components['schemas']
type TrackingResponse = Schemas['ConsultarMudancaAcompanhamentoResponseDto']
type TrackingWindow = Schemas['JanelaDaComparacaoDto']

const DOSSIE_ID = '7c1f0d7e-2b1a-4a8e-9a63-1d2f3e4a5b6c'
const DAY_MS = 24 * 60 * 60 * 1000

const euros = (value: number): Schemas['DinheiroDto'] => ({ quantiaEmCentavos: value * 100, moeda: 'EUR' })

const windowEndingAt = (ate: Date, duracaoEmDias: number): TrackingWindow => ({
  de: new Date(ate.getTime() - duracaoEmDias * DAY_MS).toISOString(),
  ate: ate.toISOString(),
  duracaoEmDias,
})

const LEITURA = new Date('2026-11-18T23:36:00Z')

const withChanges = (jogadorId: number, valorDeMercado: TrackingResponse['valorDeMercado']): TrackingResponse => ({
  dossieId: DOSSIE_ID,
  jogadorId,
  janela: { de: '2026-10-22T14:00:00Z', ate: LEITURA.toISOString(), duracaoEmDias: 27.4 },
  clube: { resultado: 'ComMudanca', anterior: 'Vila Nova Paulista', atual: 'Atlético Serrano' },
  valorDeMercado,
  minutagem: { resultado: 'ComMudanca', anterior: 820, atual: 1240, variacaoAbsoluta: 420 },
})

export const trackingWithChangesResponse = (jogadorId = 1001): TrackingResponse =>
  withChanges(jogadorId, {
    resultado: 'ComMudanca',
    anterior: euros(8_000_000),
    atual: euros(9_600_000),
    variacaoPercentualAbsoluta: 20,
  })

export const trackingMarketValueDownResponse = (jogadorId = 1001): TrackingResponse =>
  withChanges(jogadorId, {
    resultado: 'ComMudanca',
    anterior: euros(12_500_000),
    atual: euros(10_000_000),
    variacaoPercentualAbsoluta: 20,
  })

export const trackingNoRelevantChangeResponse = (jogadorId = 1002): TrackingResponse => ({
  dossieId: DOSSIE_ID,
  jogadorId,
  janela: { de: '2026-11-17T09:00:00Z', ate: '2026-11-18T23:24:00Z', duracaoEmDias: 1.6 },
  clube: { resultado: 'SemMudancaRelevante', anterior: 'Atlético Serrano', atual: 'Atlético Serrano' },
  valorDeMercado: {
    resultado: 'SemMudancaRelevante',
    anterior: euros(4_400_000),
    atual: euros(4_500_000),
    variacaoPercentualAbsoluta: 2.3,
  },
  minutagem: { resultado: 'SemMudancaRelevante', anterior: 1320, atual: 1410, variacaoAbsoluta: 90 },
})

export const trackingUnavailableResponse = (jogadorId = 1003): TrackingResponse => ({
  dossieId: DOSSIE_ID,
  jogadorId,
  janela: { de: '2026-08-03T14:00:00Z', ate: LEITURA.toISOString(), duracaoEmDias: 107.4 },
  clube: { resultado: 'ComMudanca', anterior: 'Porto Litoral', atual: 'Atlético Serrano' },
  valorDeMercado: { resultado: 'Indisponivel', anterior: euros(3_000_000), motivo: 'MoedaInesperada' },
  minutagem: { resultado: 'Indisponivel', anterior: 2310, atual: 90, motivo: 'TemporadaVirada' },
})

export const trackingOpenedTodayResponse = (jogadorId = 1008, now = new Date()): TrackingResponse => ({
  dossieId: DOSSIE_ID,
  jogadorId,
  janela: windowEndingAt(now, 0),
  clube: { resultado: 'SemMudancaRelevante', anterior: 'Atlético Serrano', atual: 'Atlético Serrano' },
  valorDeMercado: {
    resultado: 'SemMudancaRelevante',
    anterior: euros(12_500_000),
    atual: euros(12_500_000),
    variacaoPercentualAbsoluta: 0,
  },
  minutagem: { resultado: 'SemMudancaRelevante', anterior: 1284, atual: 1284, variacaoAbsoluta: 0 },
})

export const openedTrackingResult = (now = new Date()): Schemas['AbrirAcompanhamentoResult'] => ({
  dossieId: DOSSIE_ID,
  abertoEm: now.toISOString(),
  medidaEm: now.toISOString(),
})
